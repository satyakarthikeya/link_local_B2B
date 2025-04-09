# Link Local B2B

Welcome to the Link Local B2B repository! This project is currently in development.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [Backend](#backend)
- [Login Credentials](#login-credentials)
- [Contributing](#contributing)

## Prerequisites

- [Git](https://git-scm.com/)
- [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm)
- [PostgreSQL](https://www.postgresql.org/) (psql command-line tool)

## Installation

1. **Install Node.js using NVM**

   If you haven't installed Node.js using NVM yet, follow these steps:
   - First, install NVM by following the instructions on the [nvm-sh/nvm repository](https://github.com/nvm-sh/nvm).
   - Then, install the latest Node.js 20 version with:

   ```bash
   nvm install 20
   nvm use 20
   ```

2. **Clone the repository**

   Open your terminal and run the command:

   ```bash
   git clone https://github.com/satyakarthikeya/link_local_B2B.git
   ```

3. **Navigate to the project directory**

   ```bash
   cd link_local_B2B
   ```

4. **Install project dependencies**

   Once Node.js is set up, install the dependencies:

   ```bash
   npm install
   ```

*Note:* There is no need to configure an environment file.

## Running the Application

Since the project is still in development, use the following command to run the application:

```bash
npm run dev
```

Once the server is running, visit [http://localhost:5173/](http://localhost:5173/) in your browser to view the application.

## Database Setup

This project uses PostgreSQL (psql) for the database. However, the database integration is not yet ready.  
Stay tuned for further updates on how to set up and initialize the database.

## Backend

The backend for this project is being developed using Express.js. As of now, it is not fully implemented.  
Additional documentation regarding API endpoints and middleware will be provided once the backend is ready.

## Login Credentials

For testing the UI application, use the following credentials:

- **Bussiman Login**
  - Username: `test1`
  - Password: `test`

- **Delivery Man Login**
  - Username: `test2`
  - Password: `test`

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add your feature or fix description"
   ```
4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

---
For any issues or questions, please open an issue on the repository or contact the repository maintainer.