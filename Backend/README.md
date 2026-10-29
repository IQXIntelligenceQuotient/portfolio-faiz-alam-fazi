# Blog System Backend

A production-ready Node.js backend for a single-admin blog posting system with JWT authentication, PostgreSQL database, and image upload support.

## 🚀 Status

**✅ BACKEND IS READY FOR FRONTEND INTEGRATION**

All features implemented, tested, and documented. Security measures in place. Ready for production use.

---

## 📋 Features

### Core Features
- ✅ Single admin authentication with JWT
- ✅ Blog post management (CRUD)
- ✅ Category management (CRUD)
- ✅ Tag management (CRUD)
- ✅ FAQ management (CRUD)
- ✅ Image upload with validation
- ✅ Many-to-many relationship between posts and tags
- ✅ Auto-generated SEO-friendly slugs
- ✅ Unique slug handling (auto-increment)

### Security Features
- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication (7-day expiration)
- ✅ Protected admin routes
- ✅ File upload restrictions (type & size)
- ✅ Database error handling
- ✅ No sensitive data exposure

### Database Features
- ✅ PostgreSQL with proper relations
- ✅ Auto-created tables on startup
- ✅ CASCADE delete for related data
- ✅ Transaction support for data consistency
- ✅ Unique constraints on slugs

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: Joi
- **CORS**: cors

---

## 📁 Project Structure

```
├── src/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controller/
│   │   ├── authController.js     # Login & verify
│   │   ├── categoryController.js # Category CRUD
│   │   ├── tagController.js      # Tag CRUD
│   │   ├── postController.js     # Post CRUD with tags
│   │   ├── faqController.js      # FAQ CRUD
│   │   └── uploadController.js   # Image upload
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── uploadMiddleware.js   # Multer config
│   │   └── errormessage.js       # Error handler
│   ├── models/
│   │   └── blogModel.js          # Database tables
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── tagRoutes.js
│   │   ├── postRoutes.js
│   │   ├── faqRoutes.js
│   │   └── uploadRoutes.js
│   └── server.js                 # Main entry point
├── scripts/
│   └── seedAdmin.js              # Admin seeding script
├── utils/
│   └── generateSlug.js           # Slug generator
├── uploads/                      # Uploaded images
├── .env                          # Environment variables
├── .env.example                  # Environment template
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd blog-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432
DB_HOST=localhost
DB_NAME=blog_db
JWT_SECRET_KEY=your_secret_key_here
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@12345
```

4. **Create database**
```sql
CREATE DATABASE blog_db;
```

5. **Start server**
```bash
npm run dev
```

Tables will be created automatically on first run.

6. **Seed admin user**
```bash
npm run seed:admin
```

---

## 📚 Documentation

### Complete Documentation Files

1. **[QUICK_START.md](QUICK_START.md)** - Setup and installation guide
2. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with examples
3. **[BACKEND_AUDIT_REPORT.md](BACKEND_AUDIT_REPORT.md)** - Detailed audit report
4. **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - Summary of all changes made

---

## 🔑 API Endpoints

### Public Routes (No Authentication)
```
GET  /                              - Database connection test
POST /api/auth/login                - Admin login
GET  /api/categories                - Get all categories
GET  /api/tags                      - Get all tags
GET  /api/posts                     - Get all posts
GET  /api/posts/:slug               - Get single post
GET  /api/faqs/:post_id             - Get FAQs by post
```

### Protected Routes (JWT Required)
```
GET    /api/auth/verify             - Verify admin token
POST   /api/categories              - Create category
PUT    /api/categories/:id          - Update category
DELETE /api/categories/:id          - Delete category
POST   /api/tags                    - Create tag
PUT    /api/tags/:id                - Update tag
DELETE /api/tags/:id                - Delete tag
POST   /api/posts                   - Create post
PUT    /api/posts/:id               - Update post
DELETE /api/posts/:id               - Delete post
POST   /api/faqs                    - Create FAQ
PUT    /api/faqs/:id                - Update FAQ
DELETE /api/faqs/:id                - Delete FAQ
POST   /api/upload/image            - Upload image
```

---

## 💡 Usage Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@12345"}'
```

### Create Category (with auto-generated slug)
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Technology"}'
```

### Create Post with Tags
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "Post content here",
    "category_id": 1,
    "tag_ids": [1, 2, 3],
    "status": "published"
  }'
```

For complete examples, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

---

## 🗄️ Database Schema

### Tables
- **users** - Admin users with hashed passwords
- **categories** - Blog categories with unique slugs
- **posts** - Blog posts with relations to categories and users
- **tags** - Post tags with unique slugs
- **post_tags** - Many-to-many junction table
- **faqs** - FAQs linked to posts

### Relations
- `posts.category_id` → `categories.id` (ON DELETE SET NULL)
- `posts.author_id` → `users.id` (ON DELETE SET NULL)
- `post_tags.post_id` → `posts.id` (ON DELETE CASCADE)
- `post_tags.tag_id` → `tags.id` (ON DELETE CASCADE)
- `faqs.post_id` → `posts.id` (ON DELETE CASCADE)

---

## 🔒 Security

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Protected admin routes with middleware
- ✅ File upload validation (type, size)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS enabled
- ✅ Error messages don't expose sensitive data

---

## 🧪 Testing

### Manual Testing
See the complete testing checklist in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

### Quick Test
```bash
# 1. Start server
npm run dev

# 2. Test database connection
curl http://localhost:5000/

# 3. Seed admin
npm run seed:admin

# 4. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@12345"}'
```

---

## 📝 Scripts

```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run seed:admin # Seed admin user from .env
```

---

## 🐛 Troubleshooting

### Database Connection Error
- Check if PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

### Port Already in Use
- Change `PORT` in `.env` to another port

### Image Upload Fails
- Check file size (max 2MB)
- Check file type (JPG, JPEG, PNG, WEBP only)
- Ensure `uploads/` folder exists

For more troubleshooting, see [QUICK_START.md](QUICK_START.md).

---

## 📦 Dependencies

### Production
- express - Web framework
- pg - PostgreSQL client
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- multer - File upload
- cors - CORS middleware
- dotenv - Environment variables
- joi - Validation

### Development
- nodemon - Auto-reload during development

---

## 🎯 Key Features Explained

### Auto-Generated Slugs
Slugs are automatically generated from names/titles:
```
"My First Post" → "my-first-post"
"Technology" → "technology"
```

### Unique Slug Handling
Duplicate slugs are automatically handled:
```
"my-post" → "my-post"
"my-post" → "my-post-2"
"my-post" → "my-post-3"
```

### Tag Support
Posts can have multiple tags:
```json
{
  "title": "My Post",
  "content": "Content",
  "tag_ids": [1, 2, 3]
}
```

### Transaction Support
Post creation/update with tags uses database transactions for data consistency.

---

## 🚀 Frontend Integration

### Authentication
1. Login via `/api/auth/login`
2. Store JWT token in localStorage
3. Include token in Authorization header: `Bearer YOUR_TOKEN`
4. Handle 401 errors (redirect to login)

### Image Display
Use the `/uploads/` prefix:
```html
<img src="http://localhost:5000/uploads/1234567890-123456789.jpg" />
```

### API Calls
```javascript
// Example: Create post
const response = await fetch('http://localhost:5000/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Post',
    content: 'Content here',
    category_id: 1,
    tag_ids: [1, 2],
    status: 'published'
  })
});
```

For complete integration guide, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

---

## 📄 License

ISC

---

## 👨‍💻 Author

Your Name

---

## 🙏 Acknowledgments

Built with Node.js, Express, and PostgreSQL.

---

## 📞 Support

For issues or questions:
1. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
2. Check [BACKEND_AUDIT_REPORT.md](BACKEND_AUDIT_REPORT.md)
3. Check [QUICK_START.md](QUICK_START.md)

---

## ✅ Production Ready

This backend is:
- ✅ Fully tested
- ✅ Documented
- ✅ Secure
- ✅ Scalable
- ✅ Ready for frontend integration

**Start building your frontend now!**
