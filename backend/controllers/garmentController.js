const asyncHandler = require('express-async-handler');
const Garment = require('../models/Garment');

// @desc    List garments with filtering, search & pagination
// @route   GET /api/garments?type=jacket&search=denim&page=1&limit=20
// @access  Public
const getGarments = asyncHandler(async (req, res) => {
  const { type, search, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

  const query = {};
  if (type) query.type = type;
  if (search) query.$text = { $search: search };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Garment.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Garment.countDocuments(query),
  ]);

  res.json({
    items,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    totalItems: total,
  });
});

// @desc    Get a single garment by id
// @route   GET /api/garments/:id
// @access  Public
const getGarmentById = asyncHandler(async (req, res) => {
  const garment = await Garment.findById(req.params.id);
  if (!garment) {
    res.status(404);
    throw new Error('Garment not found');
  }
  res.json(garment);
});

// @desc    Create a garment (admin/catalog management)
// @route   POST /api/garments
// @access  Private/Admin
const createGarment = asyncHandler(async (req, res) => {
  const garment = await Garment.create(req.body);
  res.status(201).json(garment);
});

// @desc    Update a garment
// @route   PUT /api/garments/:id
// @access  Private/Admin
const updateGarment = asyncHandler(async (req, res) => {
  const garment = await Garment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!garment) {
    res.status(404);
    throw new Error('Garment not found');
  }
  res.json(garment);
});

// @desc    Delete a garment
// @route   DELETE /api/garments/:id
// @access  Private/Admin
const deleteGarment = asyncHandler(async (req, res) => {
  const garment = await Garment.findByIdAndDelete(req.params.id);
  if (!garment) {
    res.status(404);
    throw new Error('Garment not found');
  }
  res.json({ message: 'Garment removed' });
});

module.exports = {
  getGarments,
  getGarmentById,
  createGarment,
  updateGarment,
  deleteGarment,
};
