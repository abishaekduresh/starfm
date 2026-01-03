# Changelog

All notable changes to the Star FM Frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-01-02
### Added
- **Dashboard**: Added "Public API Endpoint" card to display the `stream` URL.
- **Ads**: Added "Show On" column to Ads list and dropdown (App/Website/All) in Add/Edit modal.
- **Channels**: Added specialized "Edit Channel" page (`edit-channel.html`).
- **Sidebar**: Added "Manage Channels" link.

### Changed
- **API Integration**: Updated `dashboard.js` to point to the new `/stream` endpoint for public data display.
- **Ads**: Improved table layout to show targeting information.
- **Channels**: "Edit" button now redirects to a dedicated page instead of opening a modal.

### Fixed
- Fixed sidebar link visibility by implementing cache-busting for JS modules.

## [1.0.0] - 2026-01-01
### Added
- Initial release of the Admin Panel Authentication (Login, Register).
- Dashboard with basic statistics.
- Channel Management (List, Create, Delete).
- Ad Management (List, Create, Delete).
