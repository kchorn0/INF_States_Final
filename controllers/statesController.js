const State = require('../model/States');
const statesData = require('../model/statesData.json'); // Import the static states data JSON file

// Controller function to get all states, optionally filtering by contiguous states
const getAllStates = async (req, res) => {
    const contig = req.query.contig;
    let filteredStates = statesData; // Start with the full list of states

    // Filter out Alaska and Hawaii if contig true
    if (contig === 'true') {
        filteredStates = statesData.filter(st => st.code !== 'AK' && st.code !== 'HI');
    } 
    // Include only Alaska and Hawaii if contig false
    else if (contig === 'false') {
        filteredStates = statesData.filter(st => st.code === 'AK' || st.code === 'HI');
    }

    const dbStates = await State.find(); // Get all state documents from the database
    const enrichedStates = filteredStates.map(state => {
        const match = dbStates.find(db => db.stateCode === state.code); // Find matching DB record
        if (match && match.funfacts?.length > 0) {
            return { ...state, funfacts: match.funfacts };
        }
        return state; // Return state without funfacts if none found
    });

    res.json(enrichedStates); // Send the list of enriched states as JSON
};

// Controller function to get a single state by abbreviation
const getState = async (req, res) => {
    const stateCode = req.params.state.toUpperCase(); // Get state code from request and capitalize it
    const state = statesData.find(state => state.code === stateCode); // Find the state in the static data

    if (!state) {
        return res.status(404).json({ message: 'Invalid state abbreviation parameter' }); // Return error if state not found
    }

    const dbState = await State.findOne({ stateCode }); // Find state document in DB
    if (dbState?.funfacts?.length > 0) {
        state.funfacts = dbState.funfacts; // Attach DB funfacts if available
    }

    res.json(state); // Send the state data as JSON
};

// Controller function to get a state's capital
const getCapital = (req, res) => {
    const stateCode = req.params.state.toUpperCase(); // Get state code from request
    const state = statesData.find(state => state.code === stateCode); // Find state in static data

    if (state) {
        res.json({ state: state.state, capital: state.capital_city }); // Send state name and capital
    } else {
        res.status(404).json({ message: 'Invalid state abbreviation parameter' }); // Return error if state not found
    }
};

// Controller function to get a state's nickname
const getNickname = (req, res) => {
    const stateCode = req.params.state.toUpperCase(); // Get state code from request
    const state = statesData.find(state => state.code === stateCode); // Find state in static data

    if (state) {
        res.json({ state: state.state, nickname: state.nickname }); // Send state name and nickname
    } else {
        res.status(404).json({ message: 'Invalid state abbreviation parameter' }); // Return error if state not found
    }
};

// Controller function to get a state's population
const getPopulation = (req, res) => {
    const stateCode = req.params.state.toUpperCase(); // Get state code from request
    const state = statesData.find(state => state.code === stateCode); // Find state in static data

    if (state) {
        res.json({ state: state.state, population: state.population.toLocaleString() }); // Send state name and formatted population
    } else {
        res.status(404).json({ message: 'Invalid state abbreviation parameter' }); // Return error if state not found
    }
};

// Controller function to get a state's admission date
const getAdmission = (req, res) => {
    const stateCode = req.params.state.toUpperCase(); // Get state code from request
    const state = statesData.find(state => state.code === stateCode); // Find state in static data

    if (state) {
        res.json({ state: state.state, admitted: state.admission_date }); // Send state name and admission date
    } else {
        res.status(404).json({ message: 'Invalid state abbreviation parameter' }); // Return error if state not found
    }
};

// Controller function to get a random fun fact for a state
const getRandomFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase(); // Get state code from request
    const state = statesData.find(st => st.code === stateCode); // Find state in static data
    if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' }); // Error if not found

    const dbState = await State.findOne({ stateCode }); // Find state document in DB
    if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` }); // Error if no funfacts
    }

    const randomFact = dbState.funfacts[Math.floor(Math.random() * dbState.funfacts.length)]; // Pick random funfact
    res.json({ funfact: randomFact }); // Return funfact
};

// Controller function to add fun facts to a state
const addFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase(); // Get state code from request
    const { funfacts } = req.body; // Get funfacts array from request body

    if (!funfacts || (Array.isArray(funfacts) && funfacts.length === 0)) {
        return res.status(400).json({ message: 'State fun facts value required' }); // Error if funfacts missing or empty
    }

    if (!Array.isArray(funfacts)) {
        return res.status(400).json({ message: 'State fun facts value must be an array' }); // Error if not an array
    }

    try {
        let state = await State.findOne({ stateCode }); // Look for existing state document

        if (!state) {
            state = new State({ stateCode, funfacts }); // Create new document if not found
        } else {
            state.funfacts = [...state.funfacts, ...funfacts]; // Append new funfacts to existing list
        }

        await state.save(); // Save document to DB
        res.status(201).json(state); // Return saved state
    } catch (err) {
        console.error(err); // Log error
        res.status(500).json({ message: 'Server error' }); // Return server error
    }
};

// Controller function to update a specific fun fact
const updateFunFact = async (req, res) => {
    const stateAbbr = req.params.state.toUpperCase(); // Get state code from request
    const { index, funfact } = req.body; // Get index and new funfact from request

    if (index === undefined) {
        return res.status(400).json({ message: 'State fun fact index value required' }); // Error if index missing
    }
    if (!funfact || typeof funfact !== 'string') {
        return res.status(400).json({ message: 'State fun fact value required' }); // Error if funfact invalid
    }

    const stateData = statesData.find((st) => st.code === stateAbbr); // Find state in static data
    if (!stateData) {
        return res.status(404).json({ message: 'Invalid state abbreviation parameter' }); // Error if not found
    }

    try {
        const state = await State.findOne({ stateCode: stateAbbr }); // Find DB state
        if (!state || !state.funfacts || state.funfacts.length === 0) {
            return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` }); // Error if no funfacts
        }

        const zeroIndex = index - 1; // Convert to zero-based index
        if (zeroIndex < 0 || zeroIndex >= state.funfacts.length) {
            return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` }); // Index out of range
        }

        state.funfacts[zeroIndex] = funfact; // Update funfact at specified index
        const result = await state.save(); // Save changes

        res.json({
            _id: result._id,
            code: result.stateCode,
            funfacts: result.funfacts,
            __v: result.__v
        }); // Return updated document

    } catch (err) {
        console.error(err); // Log error
        res.status(500).json({ message: 'Server error' }); // Return server error
    }
};

// Controller function to delete a fun fact by index
const deleteFunFact = async (req, res) => {
    const stateAbbr = req.params.state.toUpperCase(); // Get state code from request
    const { index } = req.body; // Get index from request body

    if (index === undefined) {
        return res.status(400).json({ message: 'State fun fact index value required' }); // Error if index missing
    }

    const stateData = statesData.find((st) => st.code === stateAbbr); // Find state in static data
    if (!stateData) {
        return res.status(404).json({ message: 'Invalid state abbreviation parameter' }); // Error if not found
    }

    try {
        const state = await State.findOne({ stateCode: stateAbbr }); // Find DB state
        if (!state || !state.funfacts || state.funfacts.length === 0) {
            return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` }); // Error if no funfacts
        }

        const zeroIndex = index - 1; // Convert to zero-based index
        if (zeroIndex < 0 || zeroIndex >= state.funfacts.length) {
            return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` }); // Index out of range
        }

        state.funfacts.splice(zeroIndex, 1); // Remove the funfact at index
        const result = await state.save(); // Save changes

        res.json({
            _id: result._id,
            code: state.stateCode,
            funfacts: result.funfacts,
            __v: result.__v
        }); // Return updated document

    } catch (err) {
        console.error(err); // Log error
        res.status(500).json({ message: 'Server error' }); // Return server error
    }
};

// Export all controller functions as a module
module.exports = {
    getAllStates,
    getState,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission,
    getRandomFunFact,
    addFunFact,
    updateFunFact,
    deleteFunFact
};
