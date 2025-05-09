const statesData = require('../model/statesData.json'); // Import the JSON file containing state data

// Middleware function to check if the provided state abbreviation is valid
const checkIfState = (req, res, next) => {
  const stateAbbr = req.params.state.toUpperCase(); // Convert the state parameter to uppercase
  const state = statesData.find(st => st.code === stateAbbr); // Find the state in the data by abbreviation

  if (!state) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' }); // Return error if state is not found
  }

  req.stateCode = stateAbbr; // Save the state abbreviation to the request object
  req.stateData = state; // Save the full state data to the request object
  next(); // Call the next middleware or route handler
};

module.exports = checkIfState; // Export the middleware function for use in routes
