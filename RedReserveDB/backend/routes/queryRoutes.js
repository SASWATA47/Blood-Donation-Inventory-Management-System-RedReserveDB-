const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

// Existing execute route
router.get('/execute/:queryId', queryController.executeQuery);

// NEW routes for Insert and Update
router.post('/table/:tableName', queryController.insertData);
router.put('/table/:tableName', queryController.updateData);
router.delete('/delete/:tableName', queryController.deleteData);

module.exports = router;