// requestRoutes.js
const express = require('express');
const router = express.Router();

// FIXED: Import the requestController, not the donorController!
const requestController = require('../controllers/requestController');

// FIXED: Match the '/new' path from api.js and call the createRequest function
router.post('/new', requestController.createRequest);

module.exports = router;