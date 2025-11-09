# Project Management Tool

A collaborative project management application to help teams organize, track, and manage their work.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/project-management-tool.git
    cd project-management-tool
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

## Running the Application

The application connects to a local MongoDB instance using the following connection string: `mongodb://localhost:27017/project-mgmt-test`. Make sure your MongoDB server is running.

-   **Production mode:**
    ```bash
    npm start
    ```

-   **Development mode (with auto-reloading):**
    ```bash
    npm run dev
    ```

Once the server is running, you can access the application at [http://localhost:3000](http://localhost:3000).

## Folder Structure

```
project-management-tool/
├── config/             # Database configuration
├── controllers/        # Application logic (request handling)
├── middleware/         # Express middleware
├── models/             # Mongoose data models
├── public/             # Static assets (CSS, JavaScript, images)
├── routes/             # API and view routes
├── views/              # EJS templates
├── .gitignore          # Git ignore file
├── package.json        # Project metadata and dependencies
├── server.js           # Main application entry point
└── README.md           # This file
```

## Features

-   User authentication (registration and login)
-   Create, read, update, and delete projects
-   Add members to projects for collaboration
-   Create, read, update, and delete tasks within a project
-   Assign tasks to project members
-   Comment on tasks

## API Endpoints

### Auth API

-   `POST /api/auth/register`: Register a new user.
-   `POST /api/auth/login`: Log in a user.
-   `POST /api/auth/logout`: Log out a user.

### Projects API

-   `GET /api/projects`: Get all projects for the logged-in user.
-   `GET /api/projects/:id`: Get a single project by ID.
-   `POST /api/projects`: Create a new project.
-   `PUT /api/projects/:id`: Update a project.
-   `DELETE /api/projects/:id`: Delete a project.
-   `POST /api/projects/:id/members`: Add a member to a project.

### Tasks API

-   `GET /api/tasks`: Get all tasks for a project.
-   `GET /api/tasks/:id`: Get a single task by ID.
-   `POST /api/tasks`: Create a new task.
-   `PUT /api/tasks/:id`: Update a task.
-   `DELETE /api/tasks/:id`: Delete a task.
-   `POST /api/tasks/:id/comments`: Add a comment to a task.

## License

This project is licensed under the MIT License.
