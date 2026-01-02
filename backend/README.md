# Star FM - Backend API

The backend is a RESTful API built with **PHP Slim 4**, providing data management and public stream information for the Star FM platform.

## 📂 Structure

```
backend/
├── database/
│   └── db.sql              # Database backup/schema reference
├── public/                 # Web root
│   ├── uploads/            # Stored media files (logos, ads)
│   └── index.php           # Application entry point
├── src/
│   ├── Controllers/        # Request handlers
│   │   ├── AdController.php
│   │   ├── AuthController.php
│   │   ├── ChannelController.php
│   │   └── PublicController.php
│   ├── Helpers/
│   │   └── IdGenerator.php # Unique UUID generator
│   ├── Middleware/
│   │   └── JwtMiddleware.php # Authentication middleware
│   └── Routes/
│       └── api.php         # Route definitions
└── composer.json           # Dependencies
```

## 🛠 Setup

1. **Install Dependencies**:
   ```bash
   composer install
   ```

2. **Environment Variables**:
   Create a `.env` file in the `backend` root (if not exists) or ensure your server configuration passes these variables. *Note: Currently hardcoded in some setups, check `index.php` or `settings` array.*

3. **Database**:
   Ensure the `schema.sql` (from project root) is imported. The backend connects via PDO. Configuration is typically found in `src/settings.php` or `index.php` container definitions.

## 🔐 Security

- **JWT Authentication**: Protected routes require a valid Bearer token in the `Authorization` header.
- **CORS**: Configured to allow cross-origin requests (check `index.php` for specific allowed origins).
- **Input Validation**: Controllers validate required fields and file uploads.

## 🆔 UUID System

All primary entities (`users`, `ads`, `channels`) use a custom **6-digit integer `uuid`** alongside the standard auto-increment `id`.
- The `uuid` is generated via `App\Helpers\IdGenerator`.
- It is unique per table.
- The public API exposes `uuid` instead of internal `id`.

## 📚 API Documentation

For detailed endpoint descriptions, parameters, and examples, please refer to:

👉 **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**
