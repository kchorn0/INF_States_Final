// Import the mongoose library for working with MongoDB
const mongoose = require('mongoose');

// Define an asynchronous function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // Try to connect to MongoDB using the connection string from environment variables
    await mongoose.connect(process.env.DATABASE_URI); 

    // Log a success message if the connection is successful
    console.log('MongoDB Connected');
  } catch (err) {
    // Log an error message if the connection fails
    console.error('MongoDB connection error:', err);
  }
};

// Export the connectDB function to be used in other files
module.exports = connectDB;
