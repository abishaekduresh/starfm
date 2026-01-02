# API Documentation

**Base URL**: `http://localhost:8080/api` (Development)

## Authentication

### Login
Authenticates a user and returns a JWT token.

- **Endpoint**: `POST /login`
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJ0eXAi...",
    "user": {
      "id": 1,
      "uuid": 123456,
      "name": "Admin",
      "email": "admin@example.com"
    }
  }
  ```

### Register
Registers a new admin user.

- **Endpoint**: `POST /register`
- **Body**:
  ```json
  {
    "name": "New Admin",
    "email": "new@example.com",
    "phone": "1234567890",
    "password": "securepassword"
  }
  ```

---

## Public Data (Stream App)

### Get Stream Data
Fetches all active channels and advertisements, filtered by the device platform.

- **Endpoint**: `GET /streams`
- **Access**: Public (Secured via Key/Origin)
- **Headers Required**:
  - `X-Device-Platform`: One of `android`, `ios`, `web`.
  - `X-API-KEY`: Required for ALL requests. Matches `APP_API_KEY` in env.
- **Response**:
  ```json
  {
      "status": true,
      "message": "Data fetched successfully",
      "data": { ... }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Missing or invalid `X-Device-Platform`.
  - `403 Forbidden`: Missing or invalid `X-API-KEY`.
  ```json
  {
      "status": true,
      "message": "Data fetched successfully",
      "data": {
          "settings": {
              "app_name": "Star FM",
              "ticker_text": "Welcome to Star FM..."
          },
          "channels": [
              {
                  "uuid": 132589,
                  "name": "Duresh Tech 1",
                  "stream_type": "HLS",
                  "stream_url": "https://example.com/index.m3u8",
                  "logo_path": "uploads/logo.png",
                  "status": "active",
                  "logo_url": "http://localhost:8080/backend/public/uploads/logo.png"
              }
          ],
          "ads": {
              "banner": [
                  {
                      "uuid": 789012,
                      "name": "Promo Banner",
                      "type": "banner",
                      "resolution": "16:9",
                      "display_time": 10,
                      "idle_time": 0,
                      "redirect_url": "https://google.com",
                      "show_on": "all",
                      "file_url": "http://localhost:8080/backend/public/uploads/banner.png"
                  }
              ]
          }
      }
  }
  ```

### Track Ad Click
Logs a click event for a specific ad.

- **Endpoint**: `POST /ads/{id}/click` (Note: Uses internal ID or UUID depending on implementation, currently typically Internal ID in path)
- **Body**: Empty
- **Response**: `{"message": "Click tracked"}`

---

## Channels Management (Protected)

*Requires `Authorization: Bearer <token>`*

### List Channels
- **Endpoint**: `GET /channels`
- **Response**: List of all channels (active/inactive).

### Get Channel
- **Endpoint**: `GET /channels/{id}`

### Create Channel
- **Endpoint**: `POST /channels`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `name`: string
  - `stream_type`: string (HLS, etc.)
  - `stream_url`: string
  - `status`: active/inactive
  - `logo`: File (image)

### Update Channel
- **Endpoint**: `POST /channels/{id}` (Method spoofing for file upload support)
- **Body**: Same as create, fields optional.

### Delete Channel
- **Endpoint**: `DELETE /channels/{id}`

---

## Ads Management (Protected)

*Requires `Authorization: Bearer <token>`*

### List Ads
- **Endpoint**: `GET /ads`

### Create Ad
- **Endpoint**: `POST /ads`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `name`: string
  - `type`: image/video/banner/audio
  - `show_on`: app/website/all
  - `display_time`: int (seconds)
  - `idle_time`: int (seconds)
  - `resolution`: string (e.g. 1920x1080)
  - `redirect_url`: string (optional)
  - `expiry_time`: datetime (optional)
  - `file`: File
  - `click_tracking_enabled`: boolean

### Update Ad
- **Endpoint**: `POST /ads/{id}`
- **Body**: Same as create.

### Delete Ad
- **Endpoint**: `DELETE /ads/{id}`
