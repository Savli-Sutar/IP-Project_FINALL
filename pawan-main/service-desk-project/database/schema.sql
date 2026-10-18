CREATE DATABASE IF NOT EXISTS service_ticket_db;
USE service_ticket_db;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS sla_rules (
  priority VARCHAR(50) PRIMARY KEY,
  reponse_time_limit VARCHAR(50) NOT NULL,
  resolution_time_limit VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(50),
  status VARCHAR(50) NOT NULL,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (priority) REFERENCES sla_rules(priority) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS status_history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO sla_rules(priority, reponse_time_limit, resolution_time_limit) VALUES
('Critical','1h','4h'),
('High','2h','8h'),
('Medium','4h','24h'),
('Low','8h','48h');
