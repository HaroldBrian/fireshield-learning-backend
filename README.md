# Fireshield E-learning Platform Backend

A comprehensive, production-ready E-learning platform backend built with NestJS, Prisma ORM, MySQL, and JWT authentication. This system provides a complete learning management platform with user management, course enrollment, progress tracking, messaging, and notification features specifically designed for Fireshield's training requirements.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (Admin, Trainer, Learner)
- External authentication providers (Google, Facebook, Email)
- Password reset via email with OTP verification
- Secure password hashing with bcrypt
- Rate limiting for authentication endpoints

### User Management
- Complete user CRUD operations
- Profile management with avatar support
- Role-based permissions (Admin, Trainer, Learner)
- User statistics and analytics
- Multi-language support

### Course Management
- Course creation and management with rich metadata
- Course sessions with trainer assignment and scheduling
- Course content management (videos, PDFs, quizzes, URLs, text)
- Content ordering and reordering capabilities
- Course enrollment system with status tracking
- Progress tracking for learners with completion certificates

### Learning Progress Tracking
- Individual learner progress per content item
- Course completion percentage calculation
- Progress notifications and achievements
- Detailed progress analytics for trainers and admins

### Communication System
- Internal messaging system between users
- Real-time notifications with read/unread status
- Email notifications with HTML templates
- Conversation management and history

### Email System
- Welcome emails for new users
- Password reset emails with OTP
- Enrollment confirmation emails
- Certificate delivery emails
- Progress milestone notifications
- Customizable HTML email templates

### Financial Management
- Payment tracking and management
- Multiple payment methods (Stripe, PayPal, Bank Transfer)
- Automatic invoice generation
- Payment status monitoring and alerts

### API Documentation
- Complete Swagger/OpenAPI documentation
- Interactive API explorer
- Request/response examples
- Authentication integration

### Security & Performance
- Global exception handling
- Request logging and monitoring
- Input validation with class-validator
- CORS configuration
- Helmet security middleware
- Compression middleware
- Rate limiting and throttling

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer with Handlebars templates
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Security**: Helmet, CORS, Rate limiting
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/saas_db"

# JWT Secrets (change these in production!)
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@fireshield.com"

# Application
PORT=3000
FRONTEND_URL="http://localhost:3001"
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start MySQL with Docker Compose
npm run docker:up

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

#### Option B: Local MySQL

1. Create a MySQL database named `saas_db`
2. Update the `DATABASE_URL` in your `.env` file
3. Run the setup commands:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api/v1`

### 5. Access API Documentation

Visit `http://localhost:3000/api/v1/docs` to explore the interactive Swagger documentation.

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/logout` - User logout

### Auth Providers
- `POST /auth-providers` - Create auth provider (Admin)
- `GET /auth-providers/my-providers` - Get user auth providers
- `DELETE /auth-providers/:id` - Remove auth provider

### Users
- `GET /users` - Get all users (Admin/Trainer)
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update current user profile
- `GET /users/stats` - Get user statistics (Admin)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user (Admin)
- `DELETE /users/:id` - Delete user (Admin)

### Courses
- `GET /courses` - Get all courses
- `POST /courses` - Create course (Admin/Trainer)
- `GET /courses/stats` - Get course statistics (Admin)
- `GET /courses/:id` - Get course by ID
- `GET /courses/slug/:slug` - Get course by slug
- `PATCH /courses/:id` - Update course (Admin/Trainer)
- `DELETE /courses/:id` - Delete course (Admin)

### Course Sessions
- `POST /course-sessions` - Create session (Admin/Trainer)
- `GET /course-sessions` - Get all sessions
- `GET /course-sessions/my-sessions` - Get trainer sessions
- `GET /course-sessions/stats` - Get session statistics (Admin)
- `GET /course-sessions/:id` - Get session by ID
- `PATCH /course-sessions/:id` - Update session (Admin/Trainer)
- `PATCH /course-sessions/:id/status` - Update session status
- `DELETE /course-sessions/:id` - Delete session (Admin)

### Course Contents
- `POST /course-contents` - Create content (Admin/Trainer)
- `GET /course-contents` - Get all contents
- `GET /course-contents/course/:courseId` - Get contents by course
- `GET /course-contents/stats` - Get content statistics (Admin)
- `GET /course-contents/:id` - Get content by ID
- `PATCH /course-contents/reorder/:courseId` - Reorder contents
- `PATCH /course-contents/:id` - Update content (Admin/Trainer)
- `DELETE /course-contents/:id` - Delete content (Admin/Trainer)

### Enrollments
- `POST /enrollments` - Enroll in a course
- `GET /enrollments` - Get all enrollments (Admin/Trainer)
- `GET /enrollments/my-enrollments` - Get user enrollments
- `GET /enrollments/stats` - Get enrollment statistics (Admin)
- `PATCH /enrollments/:id/confirm` - Confirm enrollment (Admin/Trainer)
- `PATCH /enrollments/:id/cancel` - Cancel enrollment

### Learner Progress
- `POST /learner-progress` - Create progress
- `GET /learner-progress` - Get all progress (Admin/Trainer)
- `GET /learner-progress/my-progress` - Get user progress
- `GET /learner-progress/course/:courseId/progress` - Get course progress
- `GET /learner-progress/stats` - Get progress statistics (Admin)
- `POST /learner-progress/complete/:contentId` - Mark content completed
- `PATCH /learner-progress/:id` - Update progress
- `DELETE /learner-progress/:id` - Delete progress (Admin)

### Messages
- `POST /messages` - Send a message
- `GET /messages` - Get messages
- `GET /messages/conversations` - Get user conversations
- `GET /messages/unread-count` - Get unread messages count
- `PATCH /messages/:id/read` - Mark message as read

### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread notifications count
- `PATCH /notifications/mark-all-read` - Mark all as read
- `PATCH /notifications/:id/read` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

## 🗄️ Database Schema

The database follows the provided data dictionary with the following main entities:

- **Users**: User accounts with roles (admin, trainer, learner)
- **Auth Providers**: External authentication provider links
- **Courses**: Course information and metadata
- **Course Sessions**: Scheduled course sessions with trainers
- **Course Contents**: Course materials (videos, PDFs, quizzes, URLs, text)
- **Enrollments**: User enrollments in course sessions
- **Learner Progress**: Individual progress tracking per content
- **Messages**: Internal messaging system
- **Notifications**: User notifications
- **Payments**: Payment tracking
- **Certificates**: Course completion certificates

## 🔧 Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start in development mode
npm run start:debug        # Start in debug mode

# Building
npm run build              # Build the application
npm run start:prod         # Start in production mode

# Database
npm run prisma:migrate     # Run database migrations
npm run prisma:generate    # Generate Prisma client
npm run prisma:seed        # Seed database with sample data
npm run prisma:studio      # Open Prisma Studio

# Docker
npm run docker:up          # Start Docker services
npm run docker:down        # Stop Docker services

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### Project Structure

```
src/
├── common/                    # Shared utilities and decorators
│   ├── decorators/           # Custom decorators
│   ├── filters/              # Exception filters
│   ├── guards/               # Authorization guards
│   └── interceptors/         # Request/response interceptors
├── config/                   # Configuration schemas
├── modules/                  # Feature modules
│   ├── auth/                # Authentication module
│   ├── auth-providers/      # External auth providers
│   ├── users/               # User management module
│   ├── courses/             # Course management module
│   ├── course-sessions/     # Course session management
│   ├── course-contents/     # Course content management
│   ├── enrollments/         # Enrollment module
│   ├── learner-progress/    # Progress tracking module
│   ├── messages/            # Messaging module
│   ├── notifications/       # Notification module
│   └── email/               # Email service module
├── prisma/                  # Database service
├── app.module.ts            # Root application module
└── main.ts                  # Application entry point
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Fine-grained permissions
- **Password Security**: Bcrypt hashing with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Cross-origin request handling
- **Helmet Integration**: Security headers
- **Environment Variables**: Secure configuration management

## 📧 Email Templates

The system includes beautiful, responsive HTML email templates for:

- **Welcome Email**: Sent to new users upon registration
- **Password Reset**: OTP-based password reset emails
- **Enrollment Confirmation**: Course enrollment confirmations
- **Progress Notifications**: Learning milestone achievements
- **Certificate Delivery**: Course completion certificates

## 🚀 Deployment

### Docker Deployment

1. Build and run with Docker Compose:

```bash
docker-compose up -d
```

### Manual Deployment

1. Build the application:

```bash
npm run build
```

2. Set production environment variables
3. Run database migrations:

```bash
npm run prisma:migrate
```

4. Start the application:

```bash
npm run start:prod
```

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Default Users

After running the seed command, you'll have these default users:

- **Admin**: admin@example.com / Admin123!
- **Trainer**: trainer@example.com / Trainer123!
- **Learner**: learner@example.com / Learner123!

## 🎯 Fireshield-Specific Features

This platform is specifically designed for Fireshield's training requirements:

- **Multi-role Support**: Administrators, Trainers, and Learners with specific permissions
- **Comprehensive Progress Tracking**: Detailed learning analytics and completion tracking
- **Flexible Content Management**: Support for various content types (videos, PDFs, quizzes, etc.)
- **Session Management**: Live and recorded training sessions with trainer assignment
- **Certificate Generation**: Automatic certificate generation upon course completion
- **Communication Tools**: Internal messaging and notification system
- **Financial Tracking**: Payment management and invoice generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the API documentation at `/api/v1/docs`
2. Review the code examples in this README
3. Open an issue for bugs or feature requests

## 🔄 Changelog

### v1.0.0
- Initial release with complete E-learning platform functionality
- JWT authentication with refresh tokens and external providers
- Role-based access control for Admin, Trainer, and Learner roles
- Comprehensive course management system with sessions and contents
- Enrollment and progress tracking with notifications
- Internal messaging system with conversation management
- Email notifications with HTML templates
- Financial management with payment tracking
- Complete API documentation with Swagger
- Docker support and production-ready security features
- Fireshield-specific customizations and workflows