import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Plus, 
  Library, 
  Save, 
  LogOut, 
  Shield,
  Play,
  X,
  ChevronDown,
  ChevronUp,
  Pencil,
  Target,
  Trash2,
  RefreshCw,
  Copy
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useWorkout } from './hooks/useWorkout';
import { ExercisesProvider, useExercises } from './hooks/useExercises';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { CreateWorkout } from './components/CreateWorkout';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { WorkoutDisplay } from './components/WorkoutDisplay';
import { NotificationModal } from './components/NotificationModal';
import { Workout } from './data/types';
import { createWorkout } from './pbService';
import { getGifUrl } from './data/gifMapping';

type View = 'home' | 'create' | 'library' | 'workout' | 'admin';

const WORKOUT_CATEGORIES = [
  { id: 'forza', name: 'Forza' },
  { id: 'cardio1', name: 'Cardio 1' },
  { id: 'cardio2', name: 'Cardio 2' }
];

const HERO_HEADLINES = [
  'Crossplanner trasforma intenzione in ritmo di allenamento.',
  'Ogni sessione parte meglio quando il piano e gia carico.',
  'Allenati con una dashboard che spinge come un coach.',
  'Metti ordine, alza il ritmo, attacca il prossimo blocco.',
  'Performance vere iniziano da una struttura senza attrito.',
  'La scheda giusta accende potenza prima ancora del warmup.',
  'Visual chiari, energia alta, esecuzione piu pulita.',
  'Ogni workout forte nasce da un sistema forte.',
  'Preparazione nitida, esecuzione aggressiva.',
  'Programma con precisione, muoviti con fame.',
  'Il tuo training flow adesso ha piu impatto e piu spinta.',
  'Pianificare bene e gia il primo gesto da atleta.',
  'Dai piu intensita al processo, non solo alla fatica.',
  'Una UI piu decisa per sessioni piu decise.',
  'Meno attrito mentale, piu energia operativa.',
  'Costruisci schede che sembrano gia in movimento.',
  'Il workout inizia quando il focus entra in schermata.',
  'Ogni dettaglio qui punta alla prossima prestazione.',
  'Semplifica il setup e libera intensita per il lavoro vero.',
  'Dalla pianificazione al timer, tutto spinge in avanti.'
];

const HERO_MESSAGES = [
  'Carica la mente, poi carica il ferro.',
  'Ogni blocco chiaro ti lascia piu energia per spingere davvero.',
  'Recupera con intelligenza, esegui con cattiveria sportiva.',
  'Precisione nel setup, ferocia nell esecuzione.',
  'Il focus cresce quando tutto il resto smette di distrarre.',
  'Allenati per ripetere bene oggi e dominare meglio domani.',
  'Una scheda pulita rende piu forti anche le decisioni veloci.',
  'Disciplina visiva, disciplina fisica.',
  'Ogni ripetizione forte nasce da una scelta chiara.',
  'Spingi sul lavoro, non sul caos.',
  'La costanza ama i sistemi che scorrono bene.',
  'Tieni alto il ritmo, ma ancora piu alta la qualita.',
  'Quando il piano e leggibile, la testa attacca meglio.',
  'Più ordine nel processo, piu intensita nel risultato.',
  'Ogni sessione merita la stessa fame del primo set.',
  'Costruisci slancio adesso e difendilo fino all ultima reps.',
  'Energia alta, pause utili, esecuzione pulita.',
  'L atleta cresce dove il sistema smette di rallentarlo.',
  'Muoviti con intenzione e lascia che il ritmo faccia il resto.',
  'Dal primo click all ultimo round, resta in avanzamento.'
];

function App() {
  const { user, role, loading, signOut } = useAuth();
  const {
    savedWorkouts,
    loadSavedWorkouts,
    saveWorkout,
    deleteWorkout
  } = useWorkout();
  const { groups, exercises: allExercises } = useExercises();
  const [currentView, setCurrentView] = useState<View>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lastView') as View) || 'home';
    }
    return 'home';
  });
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('forza');
  const [viewingExercise, setViewingExercise] = useState<any>(null);
  const [viewingExerciseData, setViewingExerciseData] = useState<any>(null);
  const [viewingExerciseGif, setViewingExerciseGif] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [heroMessageIndex, setHeroMessageIndex] = useState(0);

  useEffect(() => {
    if (role === 'enabled' || role === 'admin') {
      loadSavedWorkouts();
    }
  }, [role, loadSavedWorkouts]);

  const toggleCard = (workoutId: string) => {
    const isOpening = expandedWorkoutId !== workoutId;
    setExpandedWorkoutId(isOpening ? workoutId : null);
    if (isOpening) {
      setTimeout(() => {
        const element = document.getElementById(`workout-header-${workoutId}`);
        if (element && headerRef.current) {
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY - headerRef.current.offsetHeight - 10;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  // Persist current view to localStorage
  useEffect(() => {
    localStorage.setItem('lastView', currentView);
    // Scroll to top when view changes to home
    if (currentView === 'home') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentView]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroMessageIndex((currentIndex) => (currentIndex + 1) % HERO_MESSAGES.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleStartWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
    setCurrentView('workout');
  };

  const handleWorkoutComplete = () => {
    setActiveWorkout(null);
    setCurrentView('home');
  };

  const handleExitWorkout = () => {
    setActiveWorkout(null);
    setCurrentView('home');
  };

  const getExercisesByCategory = (workout: Workout, categoryId: string) => {
    const category = workout.stations.find((s: any) => s.id === categoryId);
    return category?.exercises || [];
  };

  // Count muscle occurrences across ALL categories in a workout
  const getMuscleCountForWorkout = (workout: Workout) => {
    const muscleCount: Record<string, number> = {};
    workout.stations.forEach((station: any) => {
      station.exercises?.forEach((ex: any) => {
        const data = getExerciseById(ex.exerciseId, ex.exerciseName);
        data?.muscles?.forEach((m: string) => {
          muscleCount[m] = (muscleCount[m] || 0) + 1;
        });
      });
    });
    return muscleCount;
  };

  const getMuscleColor = (muscle: string, muscleCount: Record<string, number>) => {
    const count = muscleCount[muscle] || 1;
    if (count >= 4) return 'bg-red-500/40 text-red-300 border border-red-500/50';
    if (count === 3) return 'bg-orange-500/40 text-orange-300 border border-orange-500/50';
    if (count === 2) return 'bg-yellow-500/40 text-yellow-300 border border-yellow-500/50';
    return 'bg-green-500/30 text-green-300 border border-green-500/40';
  };

  const getGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      chest: 'bg-red-500/30 text-red-300 border-red-500/40',
      back: 'bg-blue-500/30 text-blue-300 border-blue-500/40',
      legs: 'bg-green-500/30 text-green-300 border-green-500/40',
      arms: 'bg-orange-500/30 text-orange-300 border-orange-500/40',
      shoulders: 'bg-cyan-500/30 text-cyan-300 border-cyan-500/40',
      core: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/40',
      cardio: 'bg-purple-500/30 text-purple-300 border-purple-500/40',
    };
    return colors[group] || 'bg-zinc-500/30 text-zinc-300 border-zinc-500/40';
  };

  const getExerciseById = (id: string, name?: string) => {
    return allExercises.find(e => e.id === id) || (name ? allExercises.find(e => e.name === name) : undefined);
  };

  const getGroupForExercise = (exerciseData: any, workoutExercise?: any) => {
    const groupId = workoutExercise?.groupId;
    return groups.find((group) =>
      group.id === groupId ||
      group.id === exerciseData?.group_id ||
      group.name === exerciseData?.muscleGroup
    );
  };

  const viewingExerciseGroup = getGroupForExercise(viewingExerciseData, viewingExercise);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const year = String(d.getFullYear()).slice(-2);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Dumbbell className="w-12 h-12 text-lime-300" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (role === 'pending') {
    return (
      <Login isPendingUser pendingEmail={user?.email || undefined} />
    );
  }

  if (currentView === 'admin') {
    return (
      <div>
        <AdminPanel />
        <button
          onClick={() => setCurrentView('home')}
          className="fixed bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-dark-card rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <Dumbbell className="w-5 h-5" />
          Back to App
        </button>
      </div>
    );
  }

  if (currentView === 'workout' && activeWorkout) {
    return (
      <WorkoutDisplay 
        workout={activeWorkout} 
        onComplete={handleWorkoutComplete}
        onExit={handleExitWorkout}
      />
    );
  }

  if (currentView === 'create') {
    return (
      <CreateWorkout
        editWorkout={editingWorkout}
        onSave={(workout) => {
          // CreateWorkout already saved via updateWorkout/createWorkout
          // Just reset state here
          setEditingWorkout(null);
          setCurrentView('home');
        }}
        onStart={(workout) => {
          handleStartWorkout(workout);
        }}
        onBack={() => {
          setEditingWorkout(null);
          setCurrentView('home');
        }}
      />
    );
  }

  if (currentView === 'library') {
    return (
      <ExerciseLibrary onBack={() => setCurrentView('home')} />
    );
  }

  // Home view with inline expandable workout cards
  return (
    <div className="app-shell">
      <div ref={headerRef} className="sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="app-topbar rounded-[28px] px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 shadow-lg shadow-black/20">
                <Dumbbell className="w-6 h-6 text-lime-300" />
              </div>
              <div>
                <h1 className="display-font text-[1.6rem] font-bold uppercase leading-none text-white">Crossplanner</h1>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Benvenuto, {user.displayName?.split(' ')[0] || 'Atleta'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {role === 'admin' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="glass-btn rounded-xl p-2 text-gray-300 hover:text-white transition-colors"
                  title="Admin Panel"
                >
                  <Shield className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => {
                  setExpandedWorkoutId(null);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="glass-btn rounded-xl p-2 text-gray-300 hover:text-white transition-colors"
                title="Comprimi tutto"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'instant' }) || window.location.reload()}
                className="glass-btn rounded-xl p-2 text-gray-300 hover:text-white transition-colors"
                title="Aggiorna Pagina"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={signOut}
                className="glass-btn rounded-xl p-2 text-gray-300 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <section className="hero-panel rounded-[32px] p-5 sm:p-6 mb-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="section-kicker mb-2">Training Command Center</div>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`headline-${heroMessageIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="display-font text-2xl uppercase leading-[0.96] text-white sm:text-[2.15rem]"
                >
                  {HERO_HEADLINES[heroMessageIndex]}
                </motion.h2>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p
                  key={heroMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base"
                >
                  {HERO_MESSAGES[heroMessageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:min-w-[280px]">
              <div className="stat-chip rounded-2xl px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Schede</div>
                <div className="display-font text-3xl text-white">{savedWorkouts.length}</div>
              </div>
              <div className="stat-chip rounded-2xl px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Gruppi</div>
                <div className="display-font text-3xl text-white">{groups.length}</div>
              </div>
              <div className="stat-chip rounded-2xl px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Esercizi</div>
                <div className="display-font text-3xl text-white">{allExercises.length}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('create')}
            className="action-card action-card--primary rounded-[28px] p-5 text-left group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl border border-white/15 bg-black/15 flex items-center justify-center shrink-0">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">Build</div>
              <h3 className="display-font text-white font-bold text-2xl uppercase leading-none">Crea nuova scheda</h3>
              <p className="text-white/80 text-sm mt-1">Pianifica una sessione di crosstraining con un editor piu chiaro.</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('library')}
            className="action-card rounded-[28px] p-5 text-left group transition-colors flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 flex items-center justify-center shrink-0 transition-colors">
              <Library className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/70">Library</div>
              <h3 className="display-font text-white font-bold text-2xl uppercase leading-none">Libreria esercizi</h3>
              <p className="text-slate-300 text-sm mt-1">Consulta, aggiungi e modifica esercizi con piu densita visiva.</p>
            </div>
          </motion.button>
        </div>

        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="section-kicker mb-2">Saved Plans</div>
            <h2 className="display-font text-3xl uppercase text-white flex items-center gap-2">
              <Save className="w-6 h-6 text-orange-300" />
              Schede salvate
            </h2>
          </div>
          <div className="text-sm text-white/45">{savedWorkouts.length} totali</div>
        </div>

        {savedWorkouts.length === 0 ? (
          <div className="energy-panel rounded-[28px] p-8 text-center">
            <Dumbbell className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="display-font text-2xl uppercase text-white mb-2">Nessuna scheda salvata</p>
            <p className="text-slate-400 text-sm mb-4">Crea la tua prima struttura di allenamento.</p>
            <button
              onClick={() => setCurrentView('create')}
              className="btn-primary px-5 py-2.5 rounded-xl transition-colors"
            >
              Crea nuova scheda
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="energy-panel rounded-[28px] overflow-hidden"
              >
                <div
                  id={`workout-header-${workout.id}`}
                  className="flex items-center justify-between p-5 cursor-pointer"
                  onClick={() => toggleCard(workout.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {expandedWorkoutId === workout.id ? (
                      <ChevronUp className="w-5 h-5 text-lime-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white/40" />
                    )}
                    <div>
                      <h3 className="display-font text-2xl uppercase text-white">{workout.name}</h3>
                      <span className="text-white/40 text-sm">
                        {formatDate(workout.createdAt)} • {' '}
                        {workout.stations.reduce((acc, s) => acc + s.exercises.length, 0)} ex
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Create a proper duplicated workout - PocketBase will generate ID
                        const copy = {
                          name: workout.name + ' (copia)',
                          stations: workout.stations || [],
                          createdAt: new Date().toISOString(),
                          savedAt: new Date().toISOString()
                        };
                        // Save to PocketBase
                        createWorkout(copy).then(() => {
                          alert('Copia creata e salvata!');
                        }).catch((error) => {
                          alert('Errore nel salvare la copia: ' + error.message);
                        });
                      }}
                      className="rounded-xl border border-emerald-400/15 bg-emerald-400/10 p-2 transition-colors hover:bg-emerald-400/20"
                      title="Duplica"
                    >
                      <Copy className="w-5 h-5 text-emerald-300" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Eliminare questo workout?')) {
                          deleteWorkout(workout.id);
                        }
                      }}
                      className="rounded-xl border border-red-400/15 bg-red-400/10 p-2 transition-colors hover:bg-red-400/20"
                      title="Elimina"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingWorkout(workout);
                        setCurrentView('create');
                      }}
                      className="rounded-xl border border-cyan-300/15 bg-cyan-300/10 p-2 transition-colors hover:bg-cyan-300/20"
                      title="Modifica"
                    >
                      <Pencil className="w-5 h-5 text-cyan-200" />
                    </button>
                    {expandedWorkoutId === workout.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedWorkoutId(null);
                        }}
                        className="glass-btn rounded-xl p-2 transition-colors"
                        title="Chiudi"
                      >
                        <X className="w-5 h-5 text-gray-300" />
                      </button>
                    )}
                  </div>
                </div>

                {expandedWorkoutId === workout.id && (
                  <div className="border-t border-white/5">
                      <div className="flex gap-2 p-4">
                        {WORKOUT_CATEGORIES.map((cat) => {
                          const exercises = getExercisesByCategory(workout, cat.id);
                          const isSelected = selectedCategoryId === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setSelectedCategoryId(cat.id)}
                              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                                isSelected
                                  ? 'btn-primary'
                                  : exercises.length > 0
                                    ? 'btn-secondary text-cyan-100 hover:bg-white/10'
                                    : 'bg-black/20 text-gray-500'
                              }`}
                            >
                              {cat.name} ({exercises.length})
                            </button>
                          );
                        })}
                      </div>

                      <div className="px-4 pb-4 overflow-y-auto max-h-[480px]">
                        {(() => {
                          const muscleCount = getMuscleCountForWorkout(workout);
                          return getExercisesByCategory(workout, selectedCategoryId).map((ex: any, index: number) => {
                            const exerciseData = getExerciseById(ex.exerciseId, ex.exerciseName);
                            const exerciseGroup = getGroupForExercise(exerciseData, ex);
                            return (
                            <div 
                              key={index}
                              onClick={async () => {
                                setViewingExercise(ex);
                                setViewingExerciseData(exerciseData);
                                setViewingExerciseGif(null);
                                try {
                                  const gifUrl = await getGifUrl(ex.exerciseId);
                                  setViewingExerciseGif(gifUrl);
                                } catch {}
                              }}
                              className="rounded-2xl border border-white/6 bg-black/20 p-3 cursor-pointer transition-colors hover:bg-white/[0.05] w-full mb-2 last:mb-0"
                            >
                              <div className="flex items-start justify-between w-full">
                                <div>
                                  <span className="text-white text-base font-medium block">
                                    {ex.exerciseName || ex.exerciseId}
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {exerciseGroup && exerciseData?.muscleGroup !== 'non-assegnati' && (
                                      <span key="group" className={`px-2 py-0.5 rounded text-xs border capitalize ${exerciseGroup.color_class || getGroupColor(exerciseGroup.name)}`}>
                                        {exerciseGroup.label || exerciseGroup.name}
                                      </span>
                                    )}
                                    {exerciseData?.muscles?.map((m: string, i: number) => (
                                      <span key={i} className={`px-2 py-0.5 rounded text-xs ${getMuscleColor(m, muscleCount)}`}>{m}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            );
                          });
                        })()}
                      </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exercise Info Modal - same style as CreateWorkout */}
      {viewingExercise && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setViewingExercise(null)}
        >
          <div 
            className="energy-panel rounded-[28px] w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-orange-300" />
                <h2 className="display-font text-2xl uppercase text-white">
                  {viewingExercise.exerciseName || viewingExercise.exerciseId}
                </h2>
              </div>
              <button
                onClick={() => setViewingExercise(null)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="flex flex-col md:flex-row max-h-[calc(80vh-70px)]">
              <div className="md:w-1/2 bg-zinc-900 flex items-center justify-center p-4 min-h-[200px]">
                {viewingExerciseGif ? (
                  <img 
                    src={viewingExerciseGif} 
                    alt={viewingExercise.exerciseName} 
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-zinc-500 text-center">
                    <Dumbbell className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nessuna immagine</p>
                  </div>
                )}
              </div>
              <div className="md:w-1/2 p-6 overflow-y-auto modal-scroll">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Descrizione</h3>
                    <p className="text-zinc-300 text-base leading-relaxed">
                      {viewingExerciseData?.description || 'Nessuna descrizione disponibile.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Gruppo</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingExerciseGroup && viewingExerciseData?.muscleGroup !== 'non-assegnati' && (
                        <span className={`px-2 py-1 rounded text-sm border capitalize ${viewingExerciseGroup.color_class || getGroupColor(viewingExerciseGroup.name)}`}>
                          {viewingExerciseGroup.label || viewingExerciseGroup.name}
                        </span>
                      )}
                      {viewingExerciseData?.muscles?.map((muscle: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded text-sm bg-white/20 text-white border border-white/30">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm px-3 py-1 rounded-lg ${
                      viewingExerciseData?.tipo === 'aerobico'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {viewingExerciseData?.tipo === 'aerobico' ? 'Aerobico' : 'Anaerobico'}
                    </span>
                    <span className={`text-sm px-3 py-1 rounded-lg ${
                      viewingExerciseData?.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      viewingExerciseData?.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {viewingExerciseData?.difficulty === 'beginner' ? 'Principiante' :
                       viewingExerciseData?.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzato'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <NotificationModal />
    </div>
  );
}

export default App;
