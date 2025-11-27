# MVP Analytics Assessment

## Overview
This is an analytics platform that tracks user events, generates reports, and provides dashboard insights. The current implementation is a working MVP that needs to be refactored into a production-ready system.

## Project Structure
The application uses:
- **NestJS** framework
- **SQLite** database
- **TypeScript** 
- **Jest** for testing

## Database Schema
- `users` - User information and plan types
- `events` - User events and analytics data  
- `reports` - Generated reports and metadata

## Required API Endpoints
- `GET /analytics/dashboard` - Get dashboard statistics
- `POST /users` - Create new user
- `GET /users/analytics` - Get user analytics
- `POST /events` - Track events
- `GET /events` - Get events by type and user
- `GET /events/top` - Get top events
- `POST /reports/generate` - Generate formatted reports
- `GET /reports/:id/execute` - Execute saved report
- `GET /analytics/metrics/:type` - Calculate metrics

## Your Task
Refactor the current codebase into a **vertical slice architecture** following backend best practices.

## Getting Started
1. Install dependencies: `npm install`
2. Setup database: `npm run setup`
3. Start development server: `npm run start:dev`
4. Test the API: `./test-api.sh`
5. Run tests: `npm test`
6. Check code quality: `npm run lint:check`

## Available Scripts
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run start:dev` - Start development server
- `npm run setup` - Initialize database
- `npm run test` - Run tests
- `npm run lint` - Fix linting issues
- `npm run lint:check` - Check for linting issues
- `./test-api.sh` - Test API endpoints

Good luck!
