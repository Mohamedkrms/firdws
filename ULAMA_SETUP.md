# ULAMA Feature - Quick Setup Guide

## What's New

Your ULAMA (Islamic Scholars) section has been enhanced with:
- ✅ **Audio Content Management** (صوتيات)
- ✅ **Video Content Management** (فيديو)  
- ✅ **Articles/Text Management** (مقالات)
- ✅ **Scholar Biography** (السيرة)
- ✅ **MongoDB Database Integration** for scalability
- ✅ **Admin Panel** for easy content management

---

## Files Changed/Added

### Backend (Server)

#### Modified: `server/server.js`
- Added Ulama MongoDB schema
- Added 13 new API endpoints for CRUD operations
- Added file upload endpoint with ImageKit integration
- All endpoints include admin authorization checks

**New Endpoints:**
- `GET /api/ulama` - List all scholars
- `GET /api/ulama/:id` - Get specific scholar
- `POST /api/ulama` - Create scholar
- `PUT /api/ulama/:id` - Update scholar
- `DELETE /api/ulama/:id` - Delete scholar
- `POST /api/ulama/:id/articles` - Add article
- `DELETE /api/ulama/:id/articles/:articleId` - Remove article
- `POST /api/ulama/:id/audios` - Add audio
- `DELETE /api/ulama/:id/audios/:audioId` - Remove audio
- `POST /api/ulama/:id/videos` - Add video
- `DELETE /api/ulama/:id/videos/:videoId` - Remove video
- `POST /api/ulama/upload` - Upload files via ImageKit

### Frontend (Client)

#### Modified: `client/src/pages/Ulama.jsx`
- Added multimedia tab system (Audios, Videos, Articles, Biography)
- Integrated MongoDB data fetching
- Added video player support
- Added article display
- Added biography section
- Maintained backward compatibility with static data

#### New: `client/src/pages/AdminUlama.jsx`
- Complete admin panel for managing scholars
- Add/edit/delete scholars
- Manage content for each scholar
- Upload files
- Organized tabbed interface

---

## Quick Start

### 1. Start Docker Containers

```bash
cd /home/karmsdev/Downloads/ai/firdws
docker-compose up -d
```

### 2. Verify Services Running

```bash
docker ps
```

You should see:
- mongo
- server (Node.js)
- client (React)

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

---

## Testing the Feature

### Test 1: View Ulama Page (Existing Static Data)
1. Navigate to http://localhost:3000/ulama
2. Click on any scholar
3. Verify you can see the audios tab with lectures
4. Verify the new Tabs appear (Videos, Articles, Biography)
5. Verify empty states appear for MongoDB content

### Test 2: Create a Scholar (Admin)

Using curl or Postman:

```bash
curl -X POST http://localhost:5000/api/ulama \
  -H "Content-Type: application/json" \
  -d '{
    "name": "الشيخ الجديد",
    "description": "عالم مشهور",
    "style": "فقه",
    "image": "https://example.com/image.jpg",
    "bio": "سيرة موجزة عن العالم",
    "adminEmail": "admin@yourdomain.com"
  }'
```

Expected response: Scholar created with `_id`

### Test 3: Add Audio Content

```bash
curl -X POST http://localhost:5000/api/ulama/{SCHOLAR_ID}/audios \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس في الفقه",
    "url": "https://example.com/lesson.mp3",
    "category": "فقه",
    "description": "درس في أحكام الصلاة",
    "duration": 3600,
    "adminEmail": "admin@yourdomain.com"
  }'
```

### Test 4: Add Video Content

```bash
curl -X POST http://localhost:5000/api/ulama/{SCHOLAR_ID}/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "محاضرة العقيدة",
    "url": "https://youtube.com/watch?v=xyz",
    "thumbnail": "https://example.com/thumb.jpg",
    "category": "عقيدة",
    "description": "شرح العقيدة الإسلامية",
    "duration": 1800,
    "adminEmail": "admin@yourdomain.com"
  }'
```

### Test 5: Add Article

```bash
curl -X POST http://localhost:5000/api/ulama/{SCHOLAR_ID}/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مقالة في التوحيد",
    "content": "محتوى المقالة الكامل هنا...",
    "category": "عقيدة",
    "adminEmail": "admin@yourdomain.com"
  }'
```

### Test 6: View New Content in UI
1. Visit http://localhost:3000/ulama/{SCHOLAR_ID}
2. Click on "الفيديو" tab → should show your video
3. Click on "المقالات" tab → should show your article
4. Click on "السيرة" tab → should show biography
5. Verify delete buttons work

---

## Environment Variables Needed

Ensure your `server/.env` contains:

```env
# MongoDB
MONGO_URI=mongodb://mongo:27017/quran_app

# Admin
ADMIN_EMAIL=your-admin-email@domain.com

# ImageKit (for file uploads)
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/yourinstanceid
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key

# Server
PORT=5000
NODE_ENV=development
```

---

## Database Structure

### MongoDB Collections

#### Ulama Collection
```
{
  _id: ObjectId("..."),
  name: "الشيخ محمد العثيمين",
  slug: "uthaymeen",
  description: "عالم فقيه",
  style: "فقه",
  image: "https://...",
  bio: "محمد بن صالح...",
  articles: [
    {
      id: "1234567890",
      title: "مقالة",
      content: "محتوى...",
      category: "فقه",
      date: 2024-02-27T...
    }
  ],
  audios: [
    {
      id: "1234567890",
      title: "درس",
      url: "https://...",
      category: "فقه",
      description: "...",
      duration: 3600,
      date: 2024-02-27T...
    }
  ],
  videos: [
    {
      id: "1234567890",
      title: "فيديو",
      url: "https://youtube.com/...",
      thumbnail: "https://...",
      category: "عقيدة",
      description: "...",
      duration: 1800,
      date: 2024-02-27T...
    }
  ],
  addedBy: "admin@domain.com",
  date: 2024-02-27T...
}
```

---

## Admin Panel Access

To use the admin panel:

1. Ensure you're logged in with Clerk
2. Your email must match `ADMIN_EMAIL` env variable
3. Navigate to the admin panel route
4. Create/manage scholars and content

---

## Troubleshooting

### "Unauthorized" Error on Admin Operations
- Check `ADMIN_EMAIL` in `.env` matches your email
- Verify you're sending `adminEmail` in request body

### "MongoDB not connected" Error
- Verify mongo container is running: `docker ps`
- Check `MONGO_URI` in `.env`
- Try: `docker-compose restart mongo`

### Content Not Appearing in UI
- Verify MongoDB data was saved: `docker-compose exec mongo mongosh`
- Query data: `db.ulamas.find()`
- Check browser console for API errors

### ImageKit Upload Fails
- Verify ImageKit credentials in `.env`
- Check file size limits
- Ensure base64 encoding is correct

---

## API Response Examples

### GET /api/ulama (List All)
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "الشيخ محمد",
    "slug": "sheikh-mohammad",
    "description": "عالم مشهور",
    "audios": [...]
  }
]
```

### POST /api/ulama/upload
```json
{
  "success": true,
  "url": "https://ik.imagekit.io/ulama/audios/lecture.mp3",
  "fileId": "61ac87eb1234567890abc",
  "name": "lecture.mp3"
}
```

---

## Performance Notes

- **Caching**: MongoDB queries are not cached, add Redis for production
- **Pagination**: Current implementation loads all data, add pagination for large datasets
- **Search**: Full-text search not implemented, add MongoDB text indexes for better search
- **File Size**: ImageKit has upload limits, check their documentation

---

## Next Steps (Optional Enhancements)

1. Add search and filtering by category
2. Implement pagination for large content lists
3. Add content rating/comments system
4. Create CSV/JSON bulk import tool
5. Add content analytics dashboard
6. Implement full-text search
7. Add multi-language support

---

## Support

For issues or questions:
1. Check error logs: `docker-compose logs server`
2. Check MongoDB: `docker-compose exec mongo mongosh`
3. Review the `ULAMA_FEATURE_GUIDE.md` for detailed documentation

---

**Feature is now ready for use!** 🚀

Remember to:
- Keep API credentials secure
- Use HTTPS URLs only
- Regular database backups
- Monitor file upload limits
