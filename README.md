# Link Local B2B Application

A business-to-business e-commerce platform that connects local businesses for product sourcing and delivery.

## Features

- **Business User Management**: Register, login, and profile management for business users
- **Delivery Agent Management**: Register, login, and profile management for delivery agents
- **Product Catalog**: Create, update, search, and browse products
- **Order Processing**: Place orders, track status, and manage fulfillment
- **Delivery Management**: Assign and track delivery agents for orders

## Tech Stack

### Frontend
- React.js with hooks
- React Router for navigation
- Context API for state management
- CSS for styling

### Backend
- Node.js with Express
- PostgreSQL database
- JWT for authentication
- Winston for logging
- Joi for request validation

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd link-local
```

2. **Set up environment variables**

Copy the example environment file and update the values:

```bash
cp server/.env.example server/.env
```

Edit the `.env` file with your database credentials and other configuration.

3. **Install dependencies**

```bash
npm install
```

4. **Initialize the database**

Make sure PostgreSQL is running, then run:

```bash
npm run db:init
```

5. **Start the development servers**

In one terminal, start the backend:

```bash
npm run server:dev
```

In another terminal, start the frontend:

```bash
npm run dev
```

6. **Access the application**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Documentation

API documentation is available in the server/docs/api.md file.

## Project Structure

```
├── public/              # Static public assets
├── server/              # Backend code
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── db/              # Database scripts
│   ├── docs/            # API documentation
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Server entry point
└── src/                 # Frontend code
    ├── assets/          # Images and static resources
    ├── components/      # Reusable React components
    ├── context/         # React context providers
    ├── pages/           # Page components
    ├── styles/          # CSS files
    ├── utils/           # Utility functions
    ├── App.jsx          # Main React component
    └── main.jsx         # React entry point
```

## Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

### Starting Production Server

```bash
npm start
```

## Deployment

### Backend

1. Set up environment variables for production
2. Build the application
3. Start the server with PM2 or similar process manager

### Frontend

1. Build the frontend using `npm run build`
2. Deploy the contents of the `dist` folder to your hosting provider

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## Contact

Email- cb.ai.u4aid23128@cb.students.amrita.edu
