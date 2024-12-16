CREATE TABLE boards (
   id INT AUTO_INCREMENT PRIMARY KEY,
   category ENUM('news','qna','free','notice') NOT NULL,
   title VARCHAR(255) NOT NULL,
   content TEXT NOT NULL, 
   author_id VARCHAR(255) NOT NULL,
   author_name VARCHAR(255) NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   INDEX(author_id)
);

CREATE TABLE iframe_data (
   idx INT AUTO_INCREMENT PRIMARY KEY,
   level INT NOT NULL,
   module VARCHAR(10) NOT NULL,
   name VARCHAR(255) NOT NULL,
   description TEXT NOT NULL,
   path VARCHAR(255) NOT NULL,
   title VARCHAR(255) NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE board_posts (
   id INT AUTO_INCREMENT PRIMARY KEY,
   category ENUM('news','qna','free','notice') NOT NULL,
   title VARCHAR(255) NOT NULL,
   content TEXT NOT NULL,
   author_id VARCHAR(255) NOT NULL,
   author_name VARCHAR(255) NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   INDEX(author_id)
);

CREATE TABLE comments (
   id INT AUTO_INCREMENT PRIMARY KEY,
   post_id INT NOT NULL,
   author_id VARCHAR(255) NOT NULL,
   author_name VARCHAR(255) NOT NULL,
   content TEXT NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   INDEX(post_id)
);

CREATE TABLE completed_assignments (
    idx INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255),
    assignment_name VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    github_url VARCHAR(255),
    user_id VARCHAR(20),
    INDEX(user_name),
    INDEX(user_id)
);

CREATE TABLE user (
    idx INT AUTO_INCREMENT PRIMARY KEY,
    id VARCHAR(50) NOT NULL UNIQUE,
    pw VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('user', 'manager', 'admin') DEFAULT 'user',
    github_id VARCHAR(255),
    github_token VARCHAR(255)
);

CREATE TABLE submissions (
    idx INT AUTO_INCREMENT PRIMARY KEY,
    submit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    module_id VARCHAR(100),
    assignment_name VARCHAR(255) NOT NULL,
    assignment_path VARCHAR(255) NOT NULL,
    github_url VARCHAR(255),
    user_id VARCHAR(50),
    user_name VARCHAR(255),
    INDEX(user_id)
);