const mongoose = require('mongoose'); // Import Mongoose for MongoDB interaction

// Define the schema for a state
const stateSchema = new mongoose.Schema({
  stateCode: {
    type: String, // The stateCode field will be a string
    required: true, // The stateCode is required
    uppercase: true, // Convert the stateCode to uppercase
    unique: true // The stateCode must be unique in the database
  },
  funfacts: [String] // The funfacts field will be an array of strings
});

// Export the model named 'State' using the stateSchema (lower and plural)
module.exports = mongoose.model('State', stateSchema);
