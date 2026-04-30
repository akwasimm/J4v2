# Mock API for File Uploads

This mock API provides endpoints for uploading and managing user profile images and resumes.

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install express multer cors
   ```

2. **Start the mock API server**:
   ```bash
   npm run mock-api
   ```
   
   Or run with the frontend:
   ```bash
   npm run dev:mock
   ```

The mock API will run on `http://localhost:3001`.

## API Endpoints

### Profile Image

- **Upload**: `POST /api/user/profile-image`
  - Field name: `profileImage`
  - Accepted formats: Images (jpg, png, gif, etc.)
  - Max size: 10MB

- **Delete**: `DELETE /api/user/profile-image`

### Resume

- **Upload**: `POST /api/user/resume`
  - Field name: `resume`
  - Accepted formats: PDF, DOCX
  - Max size: 10MB

- **Delete**: `DELETE /api/user/resume`

### User Data

- **Get**: `GET /api/user/data`
  - Returns URLs to uploaded profile image and resume (if any)

### Health Check

- **Get**: `GET /api/health`
  - Returns API status

## File Storage

Files are stored in the `data/` directory:
- Profile images: `data/profile-images/`
- Resumes: `data/resumes/`

## Frontend Integration

The API client (`src/api/client.js`) includes these functions:

```javascript
import { uploadProfileImage, uploadResume, getUserFiles, deleteProfileImage, deleteResume } from './api/client';

// Upload profile image
await uploadProfileImage(file);

// Upload resume
await uploadResume(file);

// Get user files
const files = await getUserFiles();

// Delete files
await deleteProfileImage();
await deleteResume();
```

## Usage Examples

### Upload Profile Image
```javascript
const fileInput = document.getElementById('profile-image');
const file = fileInput.files[0];

try {
  const result = await uploadProfileImage(file);
  console.log('Upload successful:', result);
} catch (error) {
  console.error('Upload failed:', error);
}
```

### Display Profile Image
```javascript
const files = await getUserFiles();
if (files.profileImage) {
  const imageUrl = `http://localhost:3001${files.profileImage.url}`;
  // Use imageUrl in img tag
}
```

## Testing

1. Start the mock API server: `npm run mock-api`
2. Start the frontend: `npm run dev:frontend`
3. Navigate to profile pages and test file uploads

## Notes

- This is a mock API for development/testing purposes
- Files are stored locally and will persist between server restarts
- Only one profile image and one resume are stored per user (in this mock implementation)
- The API automatically deletes old files when new ones are uploaded
