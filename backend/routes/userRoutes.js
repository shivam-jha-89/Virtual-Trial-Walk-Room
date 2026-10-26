const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getMyProfile,
  updateMeasurements,
  updateAvatarConfig,
  toggleSavedLook,
} = require('../controllers/userController');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me/measurements', protect, updateMeasurements);
router.put('/me/avatar', protect, updateAvatarConfig);
router.post('/me/saved-looks/:garmentId', protect, toggleSavedLook);

module.exports = router;
