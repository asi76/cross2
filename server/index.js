import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Google Drive setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/oauth2callback'
);

const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || '1YRIKZ5HPL76KDOPPzbOt2qIWrlRoGHL0';
const GIFS_FOLDER_ID = process.env.DRIVE_GIFS_FOLDER_ID || 'apps/crosstraining/gif';

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Path to GIF mapping file
const MAPPING_FILE = path.join(__dirname, '..', 'public', 'gif-mapping.json');

// Load existing mapping
const loadMapping = () => {
  try {
    if (fs.existsSync(MAPPING_FILE)) {
      return JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading mapping:', e);
  }
  return {};
};

// Save mapping
const saveMapping = (mapping) => {
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
};

// Upload to Google Drive
const uploadToDrive = async (fileBuffer, fileName, exerciseId) => {
  try {
    // Set credentials if provided
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });
      
      // Refresh token if expired
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        // Update env vars with new token (for next request)
        process.env.GOOGLE_ACCESS_TOKEN = credentials.access_token;
      } catch (refreshError) {
        // Token might still be valid, continue
      }
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Find or create the GIFs folder
    let folderId = GIFS_FOLDER_ID;
    
    // Check if GIFS_FOLDER_ID is a path or direct ID
    if (!GIFS_FOLDER_ID.includes('/')) {
      // It's a direct folder ID
      folderId = GIFS_FOLDER_ID;
    } else {
      // It's a path, need to find or create the folder
      const folderPath = GIFS_FOLDER_ID.split('/');
      let parentId = DRIVE_FOLDER_ID;
      
      for (const folderName of folderPath) {
        const response = await drive.files.list({
          q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder'`,
          fields: 'files(id, name)',
        });
        
        if (response.data.files.length > 0) {
          parentId = response.data.files[0].id;
          folderId = parentId;
        } else {
          // Create folder
          const folderMeta = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
          };
          const folder = await drive.files.create({
            resource: folderMeta,
            fields: 'id',
          });
          parentId = folder.data.id;
          folderId = parentId;
        }
      }
    }

    // Delete existing file for this exercise if exists
    const existingFiles = await drive.files.list({
      q: `name contains '${exerciseId}' and '${folderId}' in parents`,
      fields: 'files(id, name)',
    });

    for (const existingFile of existingFiles.data.files) {
      await drive.files.delete({ fileId: existingFile.id });
    }

    // Upload new file
    const fileMeta = {
      name: `${exerciseId}.gif`,
      parents: [folderId],
    };

    const media = {
      mimeType: 'image/gif',
      body: Buffer.from(fileBuffer),
    };

    const response = await drive.files.create({
      resource: fileMeta,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    // Make the file public
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get public link
    const fileInfo = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink, webContentLink',
    });

    return {
      id: response.data.id,
      url: fileInfo.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
    };
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    throw error;
  }
};

// Delete from Google Drive
const deleteFromDrive = async (fileId) => {
  try {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error('Error deleting from Drive:', error);
    throw error;
  }
};

// Routes

// Upload GIF
app.post('/api/upload-gif', upload.single('gif'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { exerciseId } = req.body;
    if (!exerciseId) {
      return res.status(400).json({ error: 'Exercise ID required' });
    }

    const result = await uploadToDrive(req.file.buffer, req.file.originalname, exerciseId);

    // Update mapping
    const mapping = loadMapping();
    mapping[exerciseId] = result.url;
    saveMapping(mapping);

    res.json({ success: true, url: result.url, fileId: result.id });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Delete GIF
app.delete('/api/delete-gif', async (req, res) => {
  try {
    const { exerciseId, fileId } = req.body;
    
    if (!exerciseId) {
      return res.status(400).json({ error: 'Exercise ID required' });
    }

    // If fileId provided, delete from Drive
    if (fileId) {
      await deleteFromDrive(fileId);
    }

    // Update mapping
    const mapping = loadMapping();
    if (mapping[exerciseId]) {
      delete mapping[exerciseId];
      saveMapping(mapping);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed', details: error.message });
  }
});

// Get mapping
app.get('/api/gif-mapping', (req, res) => {
  const mapping = loadMapping();
  res.json(mapping);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
