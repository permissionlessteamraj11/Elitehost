const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/messages', supportController.getMessages);
router.post('/messages', supportController.sendMessage);

module.exports = router;
