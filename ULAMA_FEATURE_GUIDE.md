# ULAMA Feature Documentation

## Overview

The **ULAMA (العلماء)** feature has been enhanced to support multimedia content including:
- **Audio Content**: Lectures and discussions
- **Video Content**: Lessons and tutorials
- **Articles/Text**: Written works and research papers
- **Biography**: Scholar information and background

All data is stored in **MongoDB** for scalability and easy management.

---

## Backend Implementation

### Database Schema (MongoDB)

#### Ulama Collection

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  slug: String (unique, auto-generated),
  description: String,
  style: String (e.g., "حديث وسنة"),
  image: String (URL),
  bio: String (biography text),
  
  // Nested arrays for content
  articles: [{
    id: String,
    title: String (required),
    content: String,
    category: String,
    date: Date (default: now)
  }],
  
  audios: [{
    id: String,
    title: String (required),
    url: String (required),
    category: String,
    description: String,
    duration: Number (seconds),
    date: Date (default: now)
  }],
  
  videos: [{
    id: String,
    title: String (required),
    url: String (required),
    thumbnail: String (URL),
    category: String,
    description: String,
    duration: Number (seconds),
    date: Date (default: now)
  }],
  
  addedBy: String (admin email),
  date: Date (default: now)
}
```

---

## API Endpoints

### Ulama Management

#### GET `/api/ulama`
Retrieve all scholars with optional filters
- **Query Parameters**:
  - `search`: Search by name, description, or style
  - `sort`: Sort option ('newest' or by name)
- **Response**: Array of ulama documents

#### GET `/api/ulama/:id`
Get a specific scholar by ID
- **Response**: Ulama document

#### POST `/api/ulama`
Create a new scholar (admin only)
- **Body**:
  ```json
  {
    "name": "Scholar Name",
    "description": "Description",
    "style": "Specialization",
    "image": "image-url",
    "bio": "Biography text",
    "adminEmail": "admin@example.com"
  }
  ```

#### PUT `/api/ulama/:id`
Update scholar information (admin only)
- **Body**: Same as POST (optional fields)

#### DELETE `/api/ulama/:id`
Delete a scholar (admin only)
- **Query Parameters**: `adminEmail`

---

### Articles Management

#### POST `/api/ulama/:id/articles`
Add an article to a scholar
- **Body**:
  ```json
  {
    "title": "Article Title",
    "content": "Article content",
    "category": "Category name",
    "adminEmail": "admin@example.com"
  }
  ```

#### DELETE `/api/ulama/:id/articles/:articleId`
Remove an article
- **Query Parameters**: `adminEmail`

---

### Audio Management

#### POST `/api/ulama/:id/audios`
Add audio content to a scholar
- **Body**:
  ```json
  {
    "title": "Lecture Title",
    "url": "https://example.com/audio.mp3",
    "category": "Series name",
    "description": "Description",
    "duration": 3600,
    "adminEmail": "admin@example.com"
  }
  ```

#### DELETE `/api/ulama/:id/audios/:audioId`
Remove audio content
- **Query Parameters**: `adminEmail`

---

### Video Management

#### POST `/api/ulama/:id/videos`
Add video content to a scholar
- **Body**:
  ```json
  {
    "title": "Video Title",
    "url": "https://youtube.com/watch?v=...",
    "thumbnail": "https://example.com/thumb.jpg",
    "category": "Series name",
    "description": "Description",
    "duration": 1800,
    "adminEmail": "admin@example.com"
  }
  ```

#### DELETE `/api/ulama/:id/videos/:videoId`
Remove video content
- **Query Parameters**: `adminEmail`

---

### File Upload

#### POST `/api/ulama/upload`
Upload files using ImageKit (base64 format)
- **Body**:
  ```json
  {
    "file": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "fileName": "lecture.mp3",
    "folder": "audios",
    "adminEmail": "admin@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "url": "https://ik.imagekit.io/ulama/...",
    "fileId": "fileId",
    "name": "filename"
  }
  ```

---

## Frontend Implementation

### Updated Ulama Component (`src/pages/Ulama.jsx`)

#### Features:
1. **Dual Data Source**: Loads both static data (from `scholarsData.js`) and MongoDB data
2. **Tab Navigation**:
   - Audios (صوتيات) - Static data + MongoDB
   - Videos (فيديو) - MongoDB only
   - Articles (مقالات) - MongoDB only
   - Biography (السيرة) - MongoDB only

3. **Audio Player Integration**:
   - Play/pause functionality
   - Current track highlighting
   - Audio visualization with animated bars

4. **Responsive Design**:
   - Mobile-optimized tabs
   - Grid layouts for videos and articles
   - Smooth transitions and hover effects

### Admin Panel (`src/pages/AdminUlama.jsx`)

#### Features:
1. **Scholar Management**:
   - Create new scholars
   - View scholar information
   - Delete scholars

2. **Content Management**:
   - Add/remove articles
   - Add/remove audio files
   - Add/remove videos
   - Organized tab interface

3. **Content Display**:
   - List all content by type
   - Quick view of content details
   - Easy deletion with confirmation

---

## Usage Guide

### For Admin Users

#### Adding a New Scholar:
1. Navigate to Admin Ulama page
2. Click "عالم جديد" (New Scholar)
3. Fill in:
   - Name
   - Description
   - Specialization/Style
   - Image URL
   - Biography
4. Click "حفظ" (Save)

#### Adding Audio Content:
1. Select a scholar from the list
2. Switch to "الصوتيات" (Audios) tab
3. Click "إضافة محاضرة صوتية" (Add Audio)
4. Fill in:
   - Title
   - Category (optional)
   - Audio URL (hosted URL)
   - Description
   - Duration (in seconds)
5. Click "إضافة" (Add)

#### Adding Video Content:
1. Select a scholar
2. Switch to "الفيديو" (Videos) tab
3. Fill in:
   - Title
   - Category
   - Video URL (YouTube, Vimeo, etc.)
   - Thumbnail URL
   - Description
   - Duration
4. Click "إضافة" (Add)

#### Adding Articles:
1. Select a scholar
2. Switch to "المقالات" (Articles) tab
3. Fill in:
   - Title
   - Category
   - Full article content
4. Click "إضافة" (Add)

### For End Users

#### Viewing Scholar Content:
1. Visit `/ulama` page
2. Select a scholar
3. Use tabs to browse different content types:
   - **Audios**: Listen to lectures directly in browser
   - **Videos**: Watch video lessons (links to external platforms)
   - **Articles**: Read written content
   - **Biography**: Learn about the scholar

---

## Integration Notes

### ImageKit Integration
- Upload endpoint configured with ImageKit
- Supports base64 file uploads
- Files organized in `/ulama/{folder}` structure
- Set file tags for organization

### Backward Compatibility
- Static data from `scholarsData.js` continues to work
- MongoDB entries enhance existing scholars
- No breaking changes to existing functionality

### Authentication
- Admin operations require valid `adminEmail` matching `ADMIN_EMAIL` env variable
- Uses Clerk for user authentication

---

## Docker Deployment

All features work seamlessly with Docker MERN stack:

1. **MongoDB**: Persists all Ulama data
2. **Express API**: Handles all CRUD operations
3. **React Frontend**: Displays content dynamically
4. **ImageKit**: External file storage

### Environment Variables

Ensure `.env` contains:
```
MONGO_URI=mongodb://mongo:27017/quran_app
ADMIN_EMAIL=your-admin@email.com
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/yourinstanceid
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
```

---

## Example Usage

### Creating a Scholar with All Content Types

```bash
# 1. Create Scholar
curl -X POST http://localhost:5000/api/ulama \
  -H "Content-Type: application/json" \
  -d '{
    "name": "الشيخ محمد العثيمين",
    "description": "عالم فقيه ومحدث",
    "style": "شروحات ودروس",
    "image": "https://example.com/image.jpg",
    "bio": "محمد بن صالح العثيمين...",
    "adminEmail": "admin@example.com"
  }'

# 2. Add Audio
curl -X POST http://localhost:5000/api/ulama/{ulama_id}/audios \
  -H "Content-Type: application/json" \
  -d '{
    "title": "شرح رياض الصالحين",
    "url": "https://example.com/audio.mp3",
    "category": "الفقه",
    "description": "شرح كتاب رياض الصالحين",
    "duration": 3600,
    "adminEmail": "admin@example.com"
  }'

# 3. Add Video
curl -X POST http://localhost:5000/api/ulama/{ulama_id}/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس العقيدة",
    "url": "https://youtube.com/watch?v=...",
    "thumbnail": "https://example.com/thumb.jpg",
    "category": "العقيدة",
    "adminEmail": "admin@example.com"
  }'

# 4. Add Article
curl -X POST http://localhost:5000/api/ulama/{ulama_id}/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مقالة عن التوحيد",
    "content": "محتوى المقالة...",
    "category": "العقيدة",
    "adminEmail": "admin@example.com"
  }'
```

---

## Best Practices

1. **URLs**: Always use HTTPS URLs for hosted content
2. **Thumbnails**: Use high-quality thumbnails (1280x720 minimum)
3. **Descriptions**: Keep descriptions concise and informative
4. **Categories**: Use consistent category names
5. **Duration**: Always specify duration for audio/video for better UX

---

## Future Enhancements

- [ ] Direct file upload with progress tracking
- [ ] Bulk import from CSV/JSON
- [ ] Search and filter by category
- [ ] Content analytics and views tracking
- [ ] Comment system for content
- [ ] Rating system for scholars and content
- [ ] Transcription support for audio
- [ ] Multi-language support

---

## Support & Troubleshooting

### Issue: Content not appearing
- Verify MongoDB connection
- Check `adminEmail` matches `ADMIN_EMAIL` env var
- Ensure URLs are accessible

### Issue: File upload fails
- Check ImageKit credentials
- Verify base64 encoding is correct
- Ensure file size is within limits

### Issue: Admin panel not showing
- Verify user is authenticated with Clerk
- Check admin email matches env variable

---

## Summary

The new ULAMA feature provides a comprehensive multimedia platform for managing and displaying Islamic scholars' content. It maintains backward compatibility with existing static data while adding powerful MongoDB-backed content management capabilities.
