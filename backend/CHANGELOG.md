# Changelog

All notable changes to the Star FM Backend API will be documented in this file.

## [Unreleased]

## [1.3.0] - 2026-01-03
### Added
- **API Filtering**:
    - Added `type`, `status`, and `search` query parameters to `GET /ads` and `GET /channels`.
    - Implemented default filtering to exclude 'deleted' records unless explicitly requested.
- **Routes**:
    - Verified filter compatibility with `PublicController` for the `/stream` endpoint.

## [1.2.1] - 2026-01-02
### Added
- **API Security**:
    - Implemented `X-App-Key` header validation for mobile apps.
    - Implemented `Allowed-Origin` validation for websites.
    - Added `X-Device-Platform` header requirement (`android`, `ios`, `web`).
- **Ad Filtering**: Admin Panel now sends `X-Device-Platform: web` and `X-App-Key`.
- **Database**: Added `show_on` column to `ads` table via fix script.
- **Tools**: Added `starfm_api.postman_collection.json` for easy API testing.

## [1.2.0] - 2026-01-02
### Added
- **Public API**: Added `GET /stream` endpoint (PublicController) to fetch active channels and ads.
    - Returns grouped ads by type (banner, video, etc.).
    - Returns absolute URLs for logos and media files.
    - Hides internal `id` from the response (exposes `uuid` only).
- **UUID System**: Implemented 6-digit random integer `uuid` for `users`, `ads`, and `channels` tables.
- **Schema**: Added `uuid` column (UNIQUE) to `users`, `ads`, and `channels`.
- **Ads**: Added `show_on` field (`ENUM('app', 'website', 'all')`) to `ads` table.

### Changed
- **AdController**:
    - Updated `create` and `update` logic to handle `show_on` field.
    - Integrated `IdGenerator` to assign `uuid` on creation.
- **ChannelController**:
    - Integrated `IdGenerator` to assign `uuid` on creation.
- **AuthController**:
    - Integrated `IdGenerator` to assign `uuid` on user registration.
- **API Routes**:
    - Registered `/stream` as a public route.
    - Grouped protected routes under JWT middleware.

### Fixed
- **Ad Expiry**: Fixed logic in `PublicController` to correctly treat `0000-00-00 00:00:00` expiry as "Never Expire".

## [1.0.0] - 2026-01-01
### Added
- Initial release of the REST API.
- JWT Authentication (`/login`, `/register`).
- Basic CRUD for Channels (`ChannelController`).
- Basic CRUD for Ads (`AdController`).
- File upload support for channel logos and ad media.
