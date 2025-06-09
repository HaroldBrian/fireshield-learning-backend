# NestJS SaaS Backend

A comprehensive, production-ready SaaS backend built with NestJS, Prisma ORM, MySQL, and JWT authentication. This system provides a complete learning management platform with user management, course enrollment, messaging, and notification features.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (Admin, Trainer, Learner)
- Password reset via email with OTP verification
- Secure password hashing with bcrypt
- Rate limiting for authentication endpoints

### User Management
- Complete user CRUD operations
- Profile management with avatar support
- Role-based permissions
- User statistics and analytics

### Course Management
- Course creation and management
- Course sessions with trainer assignment
- Course content management (videos, PDFs, quizzes, etc.)
- Course enrollment system
- Progress tracking for learners

### Communication
- Internal messaging system between users
- Real-time notifications
- Email notifications with HTML templates
- Conversation management

### Email System
- Welcome emails for new users
- Password reset emails with OTP
- Enrollment confirmation emails
- Certificate delivery emails
- Customizable HTML email templates

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
- Rate limiting

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
FROM_EMAIL="noreply@yourapp.com"

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

### Enrollments
- `POST /enrollments` - Enroll in a course
- `GET /enrollments` - Get all enrollments (Admin/Trainer)
- `GET /enrollments/my-enrollments` - Get user enrollments
- `GET /enrollments/stats` - Get enrollment statistics (Admin)
- `PATCH /enrollments/:id/confirm` - Confirm enrollment (Admin/Trainer)
- `PATCH /enrollments/:id/cancel` - Cancel enrollment

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
- **Courses**: Course information and metadata
- **Course Sessions**: Scheduled course sessions with trainers
- **Course Contents**: Course materials (videos, PDFs, quizzes)
- **Enrollments**: User enrollments in course sessions
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
├── common/                 # Shared utilities and decorators
│   ├── decorators/        # Custom decorators
│   ├── filters/           # Exception filters
│   ├── guards/            # Authorization guards
│   └── interceptors/      # Request/response interceptors
├── config/                # Configuration schemas
├── modules/               # Feature modules
│   ├── auth/             # Authentication module
│   ├── users/            # User management module
│   ├── courses/          # Course management module
│   ├── enrollments/      # Enrollment module
│   ├── messages/         # Messaging module
│   ├── notifications/    # Notification module
│   └── email/            # Email service module
├── prisma/               # Database service
├── app.module.ts         # Root application module
└── main.ts              # Application entry point
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
- **Certificate Delivery**: Course completion certificates

Templates are built with Handlebars and include:
- Responsive design for all devices
- Professional styling with gradients and colors
- Dynamic content injection
- Company branding support

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
- Initial release with complete SaaS backend functionality
- JWT authentication with refresh tokens
- Role-based access control
- Course management system
- Enrollment and progress tracking
- Internal messaging system
- Email notifications with HTML templates
- Comprehensive API documentation
- Docker support
- Production-ready security features