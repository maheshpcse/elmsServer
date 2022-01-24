const express = require('express');
const router = express.Router();

// Server routes
router.get('/', (req, res, next) => {
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Socket works!'
    });
});
router.get('/server', (req, res, next) => {
    console.log("API works!");
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'API works!'
    });
});

// user routes

module.exports = router;