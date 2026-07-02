const express = require('express');
const router = express.Router();
const deployController = require('../controllers/deployController');
const { protect } = require('../middleware/auth');
const { deployLimiter } = require('../middleware/rateLimit');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.use(protect);

router.post('/github', deployLimiter, deployController.deployGitHub);
router.post('/zip', upload.single('zip'), deployLimiter, deployController.deployZip);
router.get('/', deployController.getDeployments);
router.get('/:id/stats', deployController.getStats);
router.post('/:id/control', deployController.controlDeployment);
router.get('/:id/logs/stream', deployController.streamLogs);

module.exports = router;
