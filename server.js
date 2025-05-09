const express = require('express'); // Import the Express framework
require('dotenv').config(); // Load environment variables from .env file
const connectDB = require('./config/dbConn'); // Import the function to connect to MongoDB
const mongoose = require('mongoose'); // Import Mongoose for MongoDB interaction
const statesRouter = require('./routes/states'); // Import the states router
const path = require('path'); // Import the path module for handling file paths
const cors = require('cors'); // Import CORS middleware

connectDB(); // Call the function to connect to MongoDB

const app = express(); // Create an Express application

app.use(cors()); // Enable Cross-Origin Resource Sharing

app.use(express.json()); // Middleware to parse JSON request bodies

app.use(express.static(path.join(__dirname, 'views'))); // Serve static files from the "views" directory

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html')); // Send the index.html file when the root URL is accessed
});

app.use('/states', statesRouter); // Use the statesRouter for all '/states' routes

app.all('*', (req, res) => { // Catch-all route for undefined paths
  const accept = req.headers.accept || ''; // Get the Accept header from the request
  if (accept.includes('application/json')) {
    res.status(404).json({ error: "404 Not Found" }); // Respond with JSON if requested
  } else {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html')); // Respond with 404.html file otherwise
  }
});

const PORT = process.env.PORT || 3000; // Set the server port from environment or default to 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Log that the server is running
});
