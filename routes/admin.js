const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const supportController = require('../controllers/supportController');
const pythonService = require('../services/python.service');
const { isAdmin, checkAdminBan } = require('../middleware/admin');

router.post('/login', checkAdminBan, adminController.login);

router.use(isAdmin);
router.post('/python/validate', async (req, res) => {
  const { code } = req.body;
  const result = await pythonService.validateCode(code);
  res.json(result);
});

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.post('/users/manage', adminController.manageUser);
router.get('/deployments', adminController.getDeployments);
router.post('/support/reply', supportController.adminReply);

module.exports = router;
