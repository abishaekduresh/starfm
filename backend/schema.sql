CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stream_type VARCHAR(50) DEFAULT 'HLS',
    stream_url TEXT NOT NULL,
    logo_path TEXT,
    status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('image', 'video', 'banner', 'audio') NOT NULL,
    resolution VARCHAR(50), 
    display_time INT DEFAULT 10,
    idle_time INT DEFAULT 0,
    redirect_url TEXT,
    status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
    expiry_time DATETIME,
    click_tracking_enabled BOOLEAN DEFAULT FALSE,
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ad_click_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ad_id INT NOT NULL,
    clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    location VARCHAR(255),
    FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
