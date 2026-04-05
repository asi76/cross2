import { useState, useRef } from 'react';
import { X, Download, Upload, Image, FileText, Loader2, CheckCircle } from 'lucide-react';
import JSZip from 'jszip';
import { getExercises as getFirebaseExercises, createExercise, updateExercise, getGroups as getFirebaseGroups, setGifMapping, uploadGif } from '../pbService';
import { saveAs } from 'file-saver';

interface ImportExportModalProps {
  exercises?: any[];
  groups?: any[];
  onClose: () => void;
  onImportComplete?: () => void;
}

export function ImportExportModal({ exercises = [], groups = [], onClose, onImportComplete }: ImportExportModalProps) {
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [isExportingImages, setIsExportingImages] = useState(false);
  const [isImportingExercises, setIsImportingExercises] = useState(false);
  const [isImportingImages, setIsImportingImages] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageZipInputRef = useRef<HTMLInputElement>(null);

  // Helper to get exercises (from props or Firebase)
  const getExercisesList = async () => {
    if (exercises && exercises.length > 0) return exercises;
    const data = await getFirebaseExercises();
    return data || [];
  };

  // Helper to get groups (from props or Firebase)
  const getGroupsList = async () => {
    if (groups && groups.length > 0) return groups;
    const data = await getFirebaseGroups();
    return data || [];
  };

  // Export all exercises with images
  const exportAllExercises = async () => {
    setIsExportingAll(true);
    setStatus({ type: 'info', message: 'Preparazione export...' });
    
    try {
      const zip = new JSZip();
      const allExercises = await getExercisesList();
      const allGroups = await getGroupsList();
      const exercisesData: any[] = [];
      
      // Collect all exercises data and images
      for (const ex of allExercises) {
        // Get GIF URL from gif_mappings
        const gifMapping = await getGifMapping(ex.id);
        
        let imageBase64 = null;
        if (gifMapping?.gif_url) {
          try {
            const response = await fetch(gifMapping.gif_url);
            if (response.ok) {
              const blob = await response.blob();
              imageBase64 = await blobToBase64(blob);
            }
          } catch {}
        }
        
        exercisesData.push({
          ...ex,
          imageBase64
        });
      }
      
      // Add exercises.json with all data
      zip.file('exercises.json', JSON.stringify(exercisesData, null, 2));
      
      // Add groups.json
      zip.file('groups.json', JSON.stringify(allGroups, null, 2));
      
      // Add images folder if there are images
      const imagesFolder = zip.folder('images');
      for (const ex of exercisesData) {
        if (ex.imageBase64) {
          const ext = getExtensionFromMime(ex.imageBase64);
          imagesFolder?.file(`${ex.id}.${ext}`, ex.imageBase64.split(',')[1], { base64: true });
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `crosstraining_exercises_${Date.now()}.zip`);
      
      setStatus({ type: 'success', message: 'Export completato!' });
    } catch (error) {
      console.error('Export error:', error);
      setStatus({ type: 'error', message: 'Errore durante export' });
    } finally {
      setIsExportingAll(false);
    }
  };

  // Export only images
  const exportImages = async () => {
    setIsExportingImages(true);
    setStatus({ type: 'info', message: 'Preparazione images...' });
    
    try {
      const zip = new JSZip();
      const allExercises = await getExercisesList();
      
      for (const ex of allExercises) {
        const gifMapping = await getGifMapping(ex.id);
        
        if (gifMapping?.gif_url) {
          try {
            const response = await fetch(gifMapping.gif_url);
            if (response.ok) {
              const blob = await response.blob();
              const ext = blob.type.split('/')[1] || 'gif';
              const base64 = await blobToBase64(blob);
              zip.file(`${ex.id}.${ext}`, base64.split(',')[1], { base64: true });
            }
          } catch {}
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `crosstraining_images_${Date.now()}.zip`);
      
      setStatus({ type: 'success', message: 'Immagini esportate!' });
    } catch (error) {
      console.error('Export images error:', error);
      setStatus({ type: 'error', message: 'Errore durante export immagini' });
    } finally {
      setIsExportingImages(false);
    }
  };

  // Import exercises from ZIP
  const importExercises = async (file: File) => {
    setIsImportingExercises(true);
    setStatus({ type: 'info', message: 'Lettura file...' });
    
    try {
      const zip = new JSZip();
      await zip.loadAsync(file);
      
      // Read exercises.json
      const exercisesJson = await zip.file('exercises.json')?.async('string');
      if (!exercisesJson) {
        throw new Error('File exercises.json non trovato nel ZIP');
      }
      
      const importedExercises = JSON.parse(exercisesJson);
      const imagesFolder = zip.folder('images');
      
      setImportProgress({ current: 0, total: importedExercises.length });
      
      // Get existing groups to map old IDs to new IDs
      const existingGroups = await getFirebaseGroups();
      const allGroups = await getGroupsList();
      const groupIdMap: Record<string, string> = {};
      
      if (existingGroups) {
        for (const oldGroup of importedExercises) {
          const existing = existingGroups.find((g: any) => g.name === allGroups.find(gr => gr.id === oldGroup.group_id)?.name);
          if (existing) {
            groupIdMap[oldGroup.group_id] = existing.id;
          }
        }
      }
      
      // Import each exercise
      for (let i = 0; i < importedExercises.length; i++) {
        const ex = importedExercises[i];
        setImportProgress({ current: i + 1, total: importedExercises.length });
        
        // Check if exercise already exists
        const firebaseExercises = await getFirebaseExercises();
        const existing = firebaseExercises.find((e: any) => e.id === ex.id);
        
        // Prepare exercise data
        const exerciseData = {
          id: ex.id,
          name: ex.name,
          muscles: ex.muscles || [],
          reps: ex.reps || null,
          duration: ex.duration || null,
          difficulty: ex.difficulty || 'intermediate',
          tipo: ex.tipo || 'anaerobico',
          description: ex.description || '',
          group_id: groupIdMap[ex.group_id] || ex.group_id
        };
        
        if (existing) {
          // Update existing
          await updateExercise(ex.id, exerciseData);
        } else {
          // Insert new
          await createExercise(exerciseData);
        }
        
        // Upload image if exists
        if (imagesFolder && ex.imageBase64) {
          const ext = getExtensionFromMime(ex.imageBase64);
          const imageBlob = await fetch(ex.imageBase64).then(r => r.blob());
          const fileName = `${ex.id}.${ext}`;
          
          try {
            const downloadUrl = await uploadGif(fileName, imageBlob);
            
            // Save GIF mapping (uses exercise_id as document ID)
            await setGifMapping(ex.id, downloadUrl);
          } catch (err) {
            console.error('Error uploading image:', err);
          }
        }
      }
      
      setStatus({ type: 'success', message: `Importati ${importedExercises.length} esercizi!` });
      onImportComplete();
    } catch (error: any) {
      console.error('Import error:', error);
      setStatus({ type: 'error', message: error.message || 'Errore durante import' });
    } finally {
      setIsImportingExercises(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  // Import images only
  const importImages = async (file: File) => {
    setIsImportingImages(true);
    setStatus({ type: 'info', message: 'Lettura immagini...' });
    
    try {
      const zip = new JSZip();
      await zip.loadAsync(file);
      
      const files = zip.filter((_, file) => !file.dir);
      setImportProgress({ current: 0, total: files.length });
      
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        setImportProgress({ current: i + 1, total: files.length });
        
        const blob = await fileObj.async('blob');
        const fileName = fileObj.name.replace(/^.*[\\/]/, '');
        
        // Upload to Firebase storage
        try {
          await uploadGif(fileName, blob);
        } catch (err) {
          console.error(`Error uploading ${fileName}:`, err);
        }
      }
      
      setStatus({ type: 'success', message: `Importate ${files.length} immagini!` });
    } catch (error: any) {
      console.error('Import images error:', error);
      setStatus({ type: 'error', message: error.message || 'Errore durante import immagini' });
    } finally {
      setIsImportingImages(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="modal-shell w-full max-w-lg overflow-hidden rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-300/10 p-2">
              <FileText className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="section-kicker mb-1">Data Transfer</div>
              <h2 className="display-font text-2xl uppercase text-white">Import / Export</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-btn rounded-xl p-2 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {status && (
            <div className={`modal-section p-3 rounded-xl text-sm ${
              status.type === 'success' ? 'bg-green-500/20 text-green-400' :
              status.type === 'error' ? 'bg-red-500/20 text-red-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {status.message}
            </div>
          )}

          {(isImportingExercises || isImportingImages) && importProgress.total > 0 && (
            <div className="text-sm text-zinc-400">
              Progresso: {importProgress.current} / {importProgress.total}
            </div>
          )}

          {/* Export All Exercises */}
          <button
            onClick={exportAllExercises}
            disabled={isExportingAll || isExportingImages || isImportingExercises || isImportingImages}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExportingAll ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            Esporta Esercizi (ZIP completo)
          </button>

          {/* Import Exercises */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={(e) => e.target.files?.[0] && importExercises(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isExportingAll || isExportingImages || isImportingExercises || isImportingImages}
            className="w-full rounded-xl border border-emerald-400/20 bg-emerald-400/15 px-4 py-3 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400/20"
          >
            {isImportingExercises ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            Importa Esercizi (ZIP)
          </button>

          <div className="modal-section rounded-2xl border-t-0 pt-4 px-4 pb-4">
            <button
              onClick={exportImages}
              disabled={isExportingAll || isExportingImages || isImportingExercises || isImportingImages}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-white font-medium transition-colors flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-400"
            >
              {isExportingImages ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              Esporta Immagini (ZIP)
            </button>

            <input
              ref={imageZipInputRef}
              type="file"
              accept=".zip"
              onChange={(e) => e.target.files?.[0] && importImages(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => imageZipInputRef.current?.click()}
              disabled={isExportingAll || isExportingImages || isImportingExercises || isImportingImages}
              className="w-full rounded-xl bg-fuchsia-500/80 px-4 py-3 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-fuchsia-400"
            >
              {isImportingImages ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              Importa Immagini (ZIP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getExtensionFromMime(dataUrl: string): string {
  const mime = dataUrl.split(';')[0].split('/')[1];
  const extMap: Record<string, string> = {
    'jpeg': 'jpg',
    'gif': 'gif',
    'png': 'png',
    'webp': 'webp'
  };
  return extMap[mime] || 'gif';
}
