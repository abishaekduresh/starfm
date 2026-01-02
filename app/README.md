# Star FM - Admin Frontend

The frontend for the Star FM Admin Panel is built using pure **Vanilla JavaScript** and **Bootstrap 5**, focusing on speed, simplicity, and modularity via ES Modules.

## 📂 Structure

```
app/
├── css/
│   └── style.css           # Custom overrides and layout styles
├── js/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.js       # Top navigation bar
│   │   └── Sidebar.js      # Side navigation menu
│   ├── pages/              # Page-specific logic
│   │   ├── ads.js          # Ads management logic
│   │   ├── channels.js     # Channels listing logic
│   │   ├── dashboard.js    # Dashboard stats and API info
│   │   ├── edit-channel.js # Edit channel form logic
│   │   └── login.js        # Authentication handling
│   ├── api.js              # API wrapper class (fetch interceptor)
│   ├── config.js           # Global configuration (Base URLs)
│   └── dom.js              # DOM manipulation helpers
├── ads.html                # Ads management view
├── channels.html           # Channels list view
├── dashboard.html          # Main dashboard view
├── edit-channel.html       # Edit channel form view
├── index.html              # Redirect/Login view
└── login.html              # Login view
```

## 🔑 Key Features

### Modular Architecture
The application uses ES6 Modules (`import`/`export`) to organize code.
- **`api.js`**: Centralized HTTP request handler that manages JWT tokens and headers.
- **`Sidebar.js`**: Dynamically generates the sidebar and handles active states.

### Authentication
- Uses JWT stored in `localStorage`.
- `api.js` automatically attaches the Bearer token to every authenticated request.
- Redirects to login if 401 Unauthorized is returned.

### Dynamic Content
- Tables for Channels and Ads are rendered dynamically via JavaScript.
- Forms use native `FormData` for handling inputs and file uploads (multipart/form-data).

## ⚙️ Configuration

The main configuration file is located at `js/config.js`.

```javascript
export const API_BASE_URL = 'http://localhost:8080/api';
export const ASSETS_URL = 'http://localhost:8080';
```

Change these values to match your backend deployment URL.

## 🚀 Running the Frontend

Since this project uses ES Modules, you **cannot** open the `.html` files directly via `file://` protocol due to CORS and module security policies. You must use a local server.

**Options:**
1. **VS Code Live Server**: Right-click `index.html` -> "Open with Live Server".
2. **PHP Built-in**: `php -S localhost:3000` inside the `app` folder.
3. **Python**: `python -m http.server 3000` inside the `app` folder.
