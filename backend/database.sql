CREATE DATABASE waste_management;
USE waste_management;

-- Create Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'admin', 'worker') NOT NULL,
  waste_reward_points INT DEFAULT 0,
  recycled_reward_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Requests Table
CREATE TABLE requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  request_type ENUM('waste', 'recycling') NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  status ENUM('pending', 'assigned', 'in_progress', 'completed', 'rejected') DEFAULT 'pending',
  assigned_worker_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_worker_id) REFERENCES users(id) ON DELETE SET NULL
);


ALTER TABLE requests ADD COLUMN rejection_reason VARCHAR(255);



ALTER TABLE users ADD COLUMN location VARCHAR(255) NOT NULL;

ALTER TABLE requests MODIFY status ENUM('pending', 'assigned', 'in_progress', 'completed', 'rejected', 'cancelled') DEFAULT 'pending';




-- Feedback table
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_id INT NOT NULL,
  feedback_text TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('request','feedback','rejected','completed') NOT NULL,
    reference_id INT NOT NULL,
    status ENUM('unread','read') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--add image
ALTER TABLE users ADD COLUMN profile_image VARCHAR(255);
ALTER TABLE requests ADD COLUMN waste_image VARCHAR(255);


CREATE TABLE rank_table (
    worker_id INT PRIMARY KEY,
    rating DECIMAL(3,2) NOT NULL,  -- average rating
    rank INT,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE worker_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('feedback','assigned') NOT NULL,
    reference_id INT NOT NULL,
    status ENUM('unread','read') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

--for forget password OTP
CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
