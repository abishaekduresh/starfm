# Star FM Admin Panel & API

A comprehensive solution for managing radio streams and advertisements for the Star FM application. This project consists of a PHP Slim 4 REST API backend and a Vanilla JavaScript frontend.

## 🚀 Features

- **Channel Management**: Create, update, and manage HLS radio streams.
- **Ad Management**: Schedule and manage banners, video, audio, and image ads.
- **Ad Targeting**: Specify platform targeting (App, Website, or All).
- **Public Stream API**: Aggregated endpoint for client applications to fetch active channels and ads.
- **Secure Authentication**: JWT-based authentication for the admin panel.
- **Unique IDs**: All records utilize a unique 6-digit UUID for robust identification.

## 🛠 Technology Stack

### Backend
- **Language**: PHP 8.x
- **Framework**: Slim 4 Framework
- **Database**: MySQL 8.x
- **Dependencies**:
    - `slim/slim`: Core framework
    - `slim/psr7`: PSR-7 implementation
    - `firebase/php-jwt`: JWT handling
    - `vlucas/phpdotenv`: Environment variable management

### Frontend
- **Language**: Vanilla JavaScript (ES6+ Modules)
- **UI Framework**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **Architecture**: Component-based (Sidebar, Navbar) with dynamic DOM manipulation.

## 📂 Project Structure

```
├── backend/                # PHP Backend API
│   ├── database/          # SQL scripts
│   ├── public/            # Public entry point (index.php, uploads)
│   ├── src/               # Source code (Controllers, Middleware, Routes)
│   └── vendor/            # Composer dependencies
├── app/                    # Admin Panel Frontend
│   ├── css/               # Styles
│   ├── js/                # JavaScript logic (pages, components)
│   └── *.html             # View templates
├── schema.sql              # Database schema definition
└── README.md               # This file
```

## ⚙️ Setup & Installation

### Prerequisites
- PHP 8.0 or higher
- Composer
- MySQL Database
- Web Server (Apache/Nginx) or PHP built-in server

### 1. Database Setup
1. Create a MySQL database (e.g., `starfm_db`).
2. Import the `schema.sql` file located in the root directory.
   ```bash
   mysql -u root -p starfm_db < schema.sql
   ```

### 2. Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies.
   ```bash
   cd backend
   composer install
   ```
3. Configure your web server to point to `backend/public` as the document root, OR serve it directly:
   ```bash
   php -S localhost:8080 -t backend/public
   ```

### 3. Frontend Setup
1. Navigate to the `app` directory.
2. Update `js/config.js` if your API URL differs from default (`http://localhost:8080/api`).
3. Serve the frontend files using a static file server (e.g., Live Server, Apache, or Python).

## 📄 Documentation

- **[Frontend Documentation](app/README.md)**
- **[Backend Documentation](backend/README.md)**
- **[API Documentation](backend/API_DOCUMENTATION.md)**

## 🛡️ License

Private and Confidential - Duresh Tech.
