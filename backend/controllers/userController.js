const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get logged-in user's profile
// @route   GET /api/users/me
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc    Update logged-in user's body measurements
//          (source can be 'manual' entry or 'pose-estimation' from MediaPipe)
// @route   PUT /api/users/me/measurements
// @access  Private
const updateMeasurements = asyncHandler(async (req, res) => {
  const {
    heightCm,
    chestCm,
    waistCm,
    hipCm,
    shoulderWidthCm,
    inseamCm,
    source,
  } = req.body;

  const required = { heightCm, chestCm, waistCm, hipCm, shoulderWidthCm, inseamCm };
  const missing = Object.entries(required).filter(([, v]) => v == null);
  if (missing.length) {
    res.status(400);
    throw new Error(`Missing measurement fields: ${missing.map(([k]) => k).join(', ')}`);
  }

  const user = await User.findById(req.user._id);
  user.measurements = {
    heightCm,
    chestCm,
    waistCm,
    hipCm,
    shoulderWidthCm,
    inseamCm,
    source: source === 'pose-estimation' ? 'pose-estimation' : 'manual',
    capturedAt: new Date(),
  };
  await user.save();

  res.json(user.measurements);
});

// @desc    Update avatar customization config
// @route   PUT /api/users/me/avatar
// @access  Private
const updateAvatarConfig = asyncHandler(async (req, res) => {
  const { bodyType, skinTone, gender } = req.body;
  const user = await User.findById(req.user._id);

  user.avatarConfig = {
    bodyType: bodyType || user.avatarConfig.bodyType,
    skinTone: skinTone || user.avatarConfig.skinTone,
    gender: gender || user.avatarConfig.gender,
  };
  await user.save();

  res.json(user.avatarConfig);
});

// @desc    Save/unsave a garment as a "look"
// @route   POST /api/users/me/saved-looks/:garmentId
// @access  Private
const toggleSavedLook = asyncHandler(async (req, res) => {
  const { garmentId } = req.params;
  const user = await User.findById(req.user._id);

  const existingIndex = user.savedLooks.findIndex(
    (look) => look.garment.toString() === garmentId
  );

  if (existingIndex >= 0) {
    user.savedLooks.splice(existingIndex, 1);
  } else {
    user.savedLooks.push({ garment: garmentId });
  }

  await user.save();
  res.json(user.savedLooks);
});

module.exports = {
  getMyProfile,
  updateMeasurements,
  updateAvatarConfig,
  toggleSavedLook,
};
