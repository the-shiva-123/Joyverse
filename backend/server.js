import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authroute.js';
import userRoutes from './routes/userroute.js';
import gameRoutes from './routes/gameroute.js';


// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Middleware
// Enable CORS for all routes
app.use(cors());
// Parse JSON bodies from incoming requests
app.use(express.json());

// Routes
// Use authentication-related routes for '/backend/auth'
app.use('/backend/auth', authRoutes);
// Use user-related routes for '/backend/users'
app.use('/backend/users', userRoutes);
app.use('/backend/games', gameRoutes); // Added this route for game sessions


// Catch-all 404 route for debugging purposes.
// This middleware will be hit if no other routes match the incoming request.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found: ' + req.originalUrl });
});

// MongoDB connection
// Connect to the MongoDB database using the URL from environment variables.
// The 'dbName' option specifies the database to connect to.
mongoose.connect(process.env.MONGO, { dbName: 'cluster0' })
  .then(() => {
    // If connection is successful, log a success message
    console.log(' MongoDB connected');
    // Start the Express server and listen on port 5000
    app.listen(5000, () => console.log(' Server running at http://localhost:5000'));
  })
  .catch((err) => {
    // If connection fails, log the error message
    console.error(' MongoDB error:', err.message);
  });