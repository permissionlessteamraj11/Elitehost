const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', walletController.getWalletInfo);
router.post('/purchase', walletController.purchasePlan);
router.post('/withdraw', walletController.withdraw);

module.exports = router;
