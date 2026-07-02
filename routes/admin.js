const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const supportController = require('../controllers/supportController');
const { isAdmin, checkAdminBan } = require('../middleware/admin');

router.post('/login', checkAdminBan, adminController.login);

router.use(isAdmin);
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.post('/users/manage', adminController.manageUser);
router.get('/deployments', adminController.getDeployments);
router.post('/support/reply', supportController.adminReply);

module.exports = router;
