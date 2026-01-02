CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid INT(6) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid INT(6) UNIQUE,
    name VARCHAR(255) NOT NULL,
    type ENUM('image', 'video', 'banner', 'audio') NOT NULL,
    resolution VARCHAR(50), 
    display_time INT DEFAULT 10,
    idle_time INT DEFAULT 0,
    redirect_url TEXT,
    show_on ENUM('app', 'website', 'all') DEFAULT 'all',
    status ENUM('active', 'inactive') DEFAULT 'active',
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

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid INT(6) UNIQUE,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    type ENUM('text', 'boolean', 'number', 'json') DEFAULT 'text',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid INT(6) UNIQUE,
    name VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Note: You'll need to run ALTER TABLE channels ADD COLUMN category_id INT DEFAULT NULL; manually for existing DBs
-- ALTER TABLE channels ADD CONSTRAINT fk_channel_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
