# Web_Project_330 - User Activity Logging Feature

## 📋 Project Overview

This is a **Smart Waste Management Platform** that connects citizens, waste workers, and administrators to streamline waste collection, recycling, and task management. This repository contains the implementation of a comprehensive **User Activity Logging System** developed for the Project 330 course.

The activity logging feature tracks and maintains logs of critical user actions including login, logout, and content creation activities across the platform.

---

## 🎯 Task Overview: User Activity Logging Feature

The User Activity Logging system is designed to track and record all user activities within the Smart Waste Management platform. This feature provides transparency and accountability by maintaining detailed logs of:

### Key Activities Logged:
- **Login Events**: Records when a user successfully logs into the system
- **Logout Events**: Tracks when a user exits the application
- **Create Operations**: Logs when users create new content or submit requests (e.g., waste collection requests, recycling requests)

### Purpose:
- Maintain an audit trail of user actions
- Support administrative monitoring and analysis
- Enable troubleshooting and security investigations
- Provide insights into platform usage patterns

---

## 🏗️ Backend Implementation

### Architecture Overview

The backend is built using **Node.js with Express.js** and follows a structured MVC pattern with the following components:

#### Technology Stack:
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MySQL 2
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Email Service**: Nodemailer
- **File Upload**: Multer
- **Additional**: CORS, dotenv for environment configuration

### Key Backend Components

#### 1. **Database Schema** (`backend/database.sql`)
```sql
CREATE TABLE activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activity_type VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**
- `id`: Unique identifier for each activity log entry
- `user_id`: Foreign key reference to the users table
- `timestamp`: Automatic timestamp of when the activity occurred
- `activity_type`: Type of activity (e.g., "login", "logout", "create")
- `description`: Detailed description of the activity

#### 2. **Authentication Controller** (`backend/controllers/authController.js`)

**Login Function Implementation:**
```javascript
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    
    const token = generateToken(user);
    
    // Log the login activity
    const logsql = `
      INSERT INTO activity_log (user_id, activity_type, description)
      VALUES (?, "login", "user loged in")
    `;
    
    db.query(logsql, [user.id], (err, result) => {
      if (err) reject(err);
      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, location: user.location }
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

**Key Features:**
- Validates user credentials against stored password hash
- Generates JWT token for authenticated sessions
- **Automatically logs login activity** to the `activity_log` table
- Returns user information along with authentication token

#### 3. **User Model** (`backend/models/userModel.js`)
Provides database operations for user management including creating users and finding users by email.

#### 4. **Routes Structure** (`backend/routes/`)
- `authRoutes.js` - Authentication endpoints (login, register, password management)
- `requestRoutes.js` - Waste and recycling request management
- `workerRoutes.js` - Worker-specific operations
- `adminRoutes.js` - Administrative functions
- `userRoutes.js` - User profile management
- `notificationsRoutes.js` - User notifications
- `feedbackRoutes.js` - Feedback management

#### 5. **Middleware** (`backend/middleware/`)
- `authMiddleware.js` - JWT token verification (protect middleware)
- `roleMiddleware.js` - Role-based access control
- `profileUpload.js` - File upload handling for profile pictures

#### 6. **Configuration** (`backend/config/db.js`)
- MySQL database connection pool setup
- Environment variable configuration for database credentials
- Connection error handling and logging

#### 7. **Utilities** (`backend/utils/`)
- `generateToken.js` - JWT token generation
- `generateOTP.js` - OTP generation for password reset
- `sendEmail.js` - Email sending via Nodemailer
- `createWorkerStatus.js` - Worker availability status management

### Backend Dependencies
```json
{
  "bcryptjs": "^3.0.3",      // Password hashing
  "cors": "^2.8.5",          // Cross-Origin Resource Sharing
  "dotenv": "^17.2.3",       // Environment variables
  "express": "^5.1.0",       // Web framework
  "jsonwebtoken": "^9.0.2",  // JWT authentication
  "multer": "^2.0.2",        // File upload handling
  "mysql2": "^3.15.3",       // MySQL database driver
  "nodemailer": "^7.0.10"    // Email sending
}
```

---

## 🔄 Frontend Integration

### How Frontend Communicates with Backend

The frontend is built using **React** and integrated with the backend through RESTful API calls.

#### Login Flow:
1. **User Input**: Frontend collects email and password from login form
2. **API Call**: Sends POST request to `/api/auth/login`
3. **Backend Processing**: Backend validates credentials and logs activity
4. **Token Storage**: Frontend stores JWT token in localStorage or state management
5. **Authenticated Requests**: Subsequent requests include JWT token in Authorization header

#### Request Creation Flow:
1. **Form Submission**: Frontend submits waste/recycling request data
2. **API Call**: Sends POST request to `/api/requests` with request details
3. **Backend Logging**: Backend logs the "create" activity to activity_log table
4. **Response**: Backend returns success/error response to frontend

#### Activity Log Retrieval (if needed):
- Frontend can fetch activity logs via API endpoint (if implemented)
- Logs can be displayed in user dashboard or admin panel

### Technology Stack:
- **Framework**: React 19.2.0
- **Styling**: CSS
- **HTML**: Standard markup
- **State Management**: React hooks/Context API (inferred from project structure)
- **Views Location**: `/frontend/views/` directory

---

## 🔀 Merge Details: Backend + Frontend Integration

### Branch Strategy

The project uses three main branches:

1. **`backend` branch**: Contains all backend server code and database setup
2. **`frontend` branch**: Contains all React frontend and UI components
3. **`exam` branch** (current): Merged version containing both backend and frontend

### Merge Process

#### Step 1: Branch Creation
- Created `backend` branch for server-side development
- Created `frontend` branch for client-side development

#### Step 2: Development
- **Backend Team** (You): 
  - Implemented authentication system with JWT
  - Created user activity logging in `authController.js`
  - Set up database schema including `activity_log` table
  - Built API routes and middleware

- **Frontend Team** (Your Teammate):
  - Built React components for login/registration
  - Created request submission forms
  - Implemented user dashboard UI
  - Integrated API calls to backend endpoints

#### Step 3: Merging
```bash
# Switch to exam branch
git checkout exam

# Merge backend branch
git merge backend

# Merge frontend branch
git merge frontend

# Resolve any conflicts if they occur
# Push merged code
git push origin exam
```

#### Step 4: Integration Testing
- Both teams tested integrated system
- Verified login activity logging works end-to-end
- Confirmed API endpoints are properly connected to UI

### Directory Structure After Merge
```
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   ├── database.sql
│   └── package.json
├── frontend/
│   └── views/
├── package.json
├── index.js
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher)
- **MySQL Server** (v5.7 or higher)
- **npm** or **yarn** package manager
- **Postman** (optional, for API testing)

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Hazerakteritu/Web_Project_330.git
cd Web_Project_330
git checkout exam
```

#### 2. Database Setup

Open MySQL client and run:
```bash
mysql -u root -p < backend/database.sql
```

Or execute the SQL queries in `backend/database.sql` manually in your MySQL GUI.

#### 3. Backend Configuration

Create `.env` file in the `backend/` directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=waste_management
PORT=5000
JWT_SECRET=your_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### 4. Install Dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

#### 5. Start the Application

Backend:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

Server will run on `http://localhost:5000`

Frontend:
```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

---

## 📡 API Endpoints for Activity Logging

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "citizen",
  "location": "123 Main St"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully"
}
```

#### 2. Login User ⭐ (Logs Activity)
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen",
    "location": "123 Main St"
  }
}
```

**Activity Logged:**
- Automatically inserts into `activity_log` table with activity_type = "login"

#### 3. Get User Profile (Protected)
```
GET /auth/get-user
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "location": "123 Main St",
  "profile_image": "filename.jpg",
  "role": "citizen"
}
```

#### 4. Update Profile (Protected)
```
PUT /auth/update-profile
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-5678",
  "location": "456 Oak Ave"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully!"
}
```

#### 5. Change Password (Protected)
```
PUT /auth/change-password
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "old_password": "current_password",
  "new_password": "new_password"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

#### 6. Forgot Password
```
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "OTP sent to your email"
}
```

#### 7. Reset Password
```
POST /auth/reset-password
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "new_password": "new_password"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful!"
}
```

### Request Management Endpoints

#### 1. Create Request ⭐ (Logs Activity)
```
POST /requests
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "request_type": "waste",
  "description": "Trash collection needed",
  "location": "123 Main St",
  "priority": "high"
}
```

**Response (201):**
```json
{
  "message": "Request created successfully",
  "request": {
    "id": 1,
    "user_id": 1,
    "request_type": "waste",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Activity Logged:**
- Automatically inserts into `activity_log` table with activity_type = "create"

---

## 💾 Database Schema

### Tables Overview

#### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'admin', 'worker') NOT NULL,
  location VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  profile_image VARCHAR(255),
  waste_reward_points INT DEFAULT 0,
  recycled_reward_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Activity Log Table ⭐
```sql
CREATE TABLE activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activity_type VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Key Fields:**
- `user_id`: Identifies which user performed the activity
- `timestamp`: When the activity occurred (auto-set)
- `activity_type`: "login", "logout", or "create"
- `description`: Human-readable description of the activity

#### Requests Table
```sql
CREATE TABLE requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  request_type ENUM('waste', 'recycling') NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  status ENUM('pending', 'assigned', 'in_progress', 'completed', 'rejected', 'cancelled') DEFAULT 'pending',
  assigned_worker_id INT,
  rejection_reason VARCHAR(255),
  waste_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_worker_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### Worker Status Table
```sql
CREATE TABLE worker_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL,
  status ENUM('free','busy') DEFAULT 'free',
  location VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Notifications Table
```sql
CREATE TABLE user_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    worker_id INT NULL,
    type ENUM('assigned', 'rejected', 'completed') NOT NULL,
    request_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    status ENUM('unread', 'read') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### Password Resets Table
```sql
CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing the Feature

### Using Postman

#### Test 1: User Registration
1. Create new request: `POST http://localhost:5000/api/auth/register`
2. Set Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPassword123",
  "role": "citizen",
  "location": "Test Location"
}
```
3. Send request → Should get 201 Created response

#### Test 2: User Login (Logs Activity)
1. Create new request: `POST http://localhost:5000/api/auth/login`
2. Set Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "TestPassword123"
}
```
3. Send request → Should get 200 OK with JWT token
4. **Check Database**: Run this query in MySQL:
```sql
SELECT * FROM activity_log WHERE activity_type = 'login' ORDER BY timestamp DESC LIMIT 5;
```
**Expected Result**: Should see new entry with activity_type = 'login'

#### Test 3: Create Request (Logs Activity)
1. Create new request: `POST http://localhost:5000/api/requests`
2. Set Headers:
```
Authorization: Bearer <jwt_token_from_login>
Content-Type: application/json
```
3. Set Body (JSON):
```json
{
  "request_type": "waste",
  "description": "Need garbage collection",
  "location": "Test Address",
  "priority": "high"
}
```
4. Send request → Should get 201 Created
5. **Check Database**: Run this query:
```sql
SELECT * FROM activity_log WHERE activity_type = 'create' ORDER BY timestamp DESC LIMIT 5;
```
**Expected Result**: Should see new entry with activity_type = 'create'

#### Test 4: View All Activities for a User
```sql
SELECT * FROM activity_log WHERE user_id = 1 ORDER BY timestamp DESC;
```

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcryptjs (10 salt rounds)
- **Role-Based Access Control**: Three roles - citizen, worker, admin
- **Protected Routes**: Middleware checks JWT before accessing endpoints

### Data Protection
- **Foreign Keys**: Maintain referential integrity
- **ON DELETE CASCADE**: Automatic cleanup of related records
- **Input Validation**: Server-side validation of all inputs
- **CORS**: Controlled cross-origin requests

---

## 📊 Project Statistics

- **Backend**: Node.js + Express.js
- **Frontend**: React 19.2.0
- **Database**: MySQL
- **Languages**: JavaScript, CSS, HTML
- **Authentication**: JWT + bcryptjs
- **Total Tables**: 8 (Users, Requests, Activity Log, Notifications, Worker Status, Rank, Feedback, Password Resets)

---

## 🤝 Team Collaboration

### Your Contributions (Backend)
- ✅ Database schema design including activity_log table
- ✅ User authentication and login system with activity logging
- ✅ API endpoints and route configuration
- ✅ JWT token generation and verification
- ✅ Password reset and change functionality
- ✅ User profile management endpoints
- ✅ Database configuration and connection setup

### Teammate's Contributions (Frontend)
- ✅ React components for login and registration
- ✅ User dashboard interface
- ✅ Request creation and management UI
- ✅ API integration and data binding
- ✅ Responsive styling and layout
- ✅ User notification displays

---

## 📝 Future Enhancements

Potential features for future development:
1. **Activity Log Visualization**: Dashboard showing activity trends
2. **Advanced Filtering**: Filter logs by date range, activity type, user role
3. **Export Functionality**: Export activity logs as CSV/PDF for reporting
4. **Real-time Notifications**: WebSocket integration for instant updates
5. **Activity Analytics**: Charts and graphs of platform usage
6. **Logout Logging**: Track when users log out
7. **Admin Audit Dashboard**: Comprehensive view of all system activities

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Database connection error
```
Solution: Check .env file has correct DB_HOST, DB_USER, DB_PASS, DB_NAME
```

**Issue**: JWT token undefined
```
Solution: Make sure JWT_SECRET is set in .env file
```

**Issue**: Activity not logging on login
```
Solution: Verify activity_log table exists in database (run database.sql)
```

**Issue**: CORS errors from frontend
```
Solution: Ensure CORS is enabled in backend/app.js
```

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Introduction](https://jwt.io/introduction)
- [React Documentation](https://react.dev/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

---

## 📄 License

ISC License

---

## ✉️ Contact & Support

For questions or issues regarding this project, please reach out to the development team.

**Project Created By**: Hazerakteritu  
**Course**: Project 330  
**Last Updated**: 2024

---

**Happy Coding! 🚀**
