# Turtle Soup Server

A robust Express.js backend server built with TypeScript that provides authentication, user management, and API endpoints for the Turtle Soup application.

## Overview

Turtle Soup Server is a Node.js Express application that provides a secure and scalable backend for the Turtle Soup client application. It features Google OAuth 2.0 authentication, user session management, PostgreSQL database integration, and a structured architecture following best practices.

## App URL

https://turtle-soup-server.onrender.com

## Features

- **Google OAuth 2.0 Authentication**: Secure user authentication using Google's OAuth 2.0 protocol
- **User Management**: Store and retrieve user profiles with PostgreSQL database
- **Session Management**: Secure cookie-based session management 
- **CORS Support**: Configured Cross-Origin Resource Sharing for secure client-server communication
- **API Endpoints**: RESTful API architecture
- **Error Handling**: Comprehensive error handling and reporting
- **Health Monitoring**: Health check endpoints for monitoring system status

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: Passport.js with Google OAuth 2.0
- **Session Management**: express-session
- **Configuration**: node-config for environment-based configuration
- **Database Migration**: Flyway

## Project Structure

```
src/
├── app.ts                 # Main application entry point
├── controllers/           # Route controllers
│   ├── auth.controller.ts # Authentication controller
│   └── util.controller.ts # Utility endpoints controller
├── routes/                # Route definitions
│   ├── auth.routes.ts     # Authentication routes
│   ├── index.ts           # Main router configuration
│   └── utils.routes.ts    # Utility routes
├── services/              # Business logic services
│   └── user.service.ts    # User management service
└── utils/                 # Utility functions and classes
    └── erros.ts           # Error handling utilities
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Google OAuth 2.0 credentials
- Yarn package manager

### Running the Server

#### Development

```
yarn dev
```

#### Production

Build and start the production server:

```
yarn build
yarn start
```

## API Endpoints

### Authentication

- `GET /auth/google` - Initiates Google OAuth 2.0 login flow
- `GET /auth/google/callback` - Google OAuth 2.0 callback endpoint
- `GET /auth/login/check-auth` - Check if user is authenticated
- `GET /auth/logout` - Log out the current user

### Utility

- `GET /utils/healthCheck` - Server health check endpoint

## License

MIT License 