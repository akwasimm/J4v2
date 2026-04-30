// Mock API Server for File Uploads
// Run with: node mock-api.js

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/data', express.static('data'));

// Ensure data directories exist
const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-zA-Z]):/, '$1:');
const profileImagesDir = path.join(__dirname, 'data', 'profile-images');
const resumesDir = path.join(__dirname, 'data', 'resumes');

[profileImagesDir, resumesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      cb(null, profileImagesDir);
    } else if (file.fieldname === 'resume') {
      cb(null, resumesDir);
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      // Accept common image formats
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile images'), false);
      }
    } else if (file.fieldname === 'resume') {
      // Accept PDF and DOCX files
      if (file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and DOCX files are allowed for resumes'), false);
      }
    } else {
      cb(new Error('Invalid field name'), false);
    }
  }
});

// Mock user data storage
let userData = {
  profileImage: null,
  resume: null
};

// Routes

// Profile Image Upload
app.post('/api/user/profile-image', upload.single('profileImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old profile image if exists
    if (userData.profileImage) {
      const oldPath = path.join(__dirname, userData.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Store new file path relative to project root
    userData.profileImage = path.join('data', 'profile-images', req.file.filename);
    
    res.json({ 
      success: true, 
      message: 'Profile image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/data/profile-images/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resume Upload
app.post('/api/user/resume', upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old resume if exists
    if (userData.resume) {
      const oldPath = path.join(__dirname, userData.resume);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Store new file path relative to project root
    userData.resume = path.join('data', 'resumes', req.file.filename);
    
    res.json({ 
      success: true, 
      message: 'Resume uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/data/resumes/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get User Data
app.get('/api/user/data', (req, res) => {
  res.json({
    profileImage: userData.profileImage ? {
      url: userData.profileImage.replace(/\\/g, '/')
    } : null,
    resume: userData.resume ? {
      url: userData.resume.replace(/\\/g, '/')
    } : null
  });
});

// Delete Profile Image
app.delete('/api/user/profile-image', (req, res) => {
  try {
    if (userData.profileImage) {
      const filePath = path.join(__dirname, userData.profileImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      userData.profileImage = null;
    }
    res.json({ success: true, message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Resume
app.delete('/api/user/resume', (req, res) => {
  try {
    if (userData.resume) {
      const filePath = path.join(__dirname, userData.resume);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      userData.resume = null;
    }
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Mock API is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${path.join(__dirname, 'data')}`);
  console.log(`📸 Profile images: ${profileImagesDir}`);
  console.log(`📄 Resumes: ${resumesDir}`);
});
