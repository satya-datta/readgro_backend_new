const express = require('express');
const certificaterouter = express.Router();
const certificateController = require('../controller/certificateController');
// If you have authentication middleware, you can uncomment the line below
// const authMiddleware = require('../middleware/auth');

// Request a certificate (sends details to admin)
certificaterouter.post('/certificateRequest', /* authMiddleware, */ certificateController.requestCertificate);

module.exports = certificaterouter;
