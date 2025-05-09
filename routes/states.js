const express = require('express'); // Import Express framework
const router = express.Router(); // Create a new router object from Express
const statesController = require('../controllers/statesController'); // Import the states controller functions
const checkIfState = require('../middleware/checkIfState'); // Import the middleware to check if the state exists

// Define route to get all states
router.route('/')
  .get(statesController.getAllStates); // Call getAllStates function from the statesController when GET request is made

// Define route to get information for a specific state
router.route('/:state')
  .get(checkIfState, statesController.getState); // Use checkIfState middleware and then call getState function from statesController

// Define routes for fun facts of a specific state
router.route('/:state/funfact')
  .get(checkIfState, statesController.getRandomFunFact) // Use checkIfState middleware and then call getRandomFunFact function
  .post(checkIfState, statesController.addFunFact) // Use checkIfState middleware and then call addFunFact function
  .patch(checkIfState, statesController.updateFunFact) // Use checkIfState middleware and then call updateFunFact function
  .delete(checkIfState, statesController.deleteFunFact); // Use checkIfState middleware and then call deleteFunFact function

// Define route to get the capital of a specific state
router.route('/:state/capital')
  .get(checkIfState, statesController.getCapital); // Use checkIfState middleware and then call getCapital function

// Define route to get the nickname of a specific state
router.route('/:state/nickname')
  .get(checkIfState, statesController.getNickname); // Use checkIfState middleware and then call getNickname function

// Define route to get the population of a specific state
router.route('/:state/population')
  .get(checkIfState, statesController.getPopulation); // Use checkIfState middleware and then call getPopulation function

// Define route to get the admission date of a specific state
router.route('/:state/admission')
  .get(checkIfState, statesController.getAdmission); // Use checkIfState middleware and then call getAdmission function

module.exports = router; // Export the router to be used in other parts of the application
