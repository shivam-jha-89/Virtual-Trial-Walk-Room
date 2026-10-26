const express = require('express');
const { protect, admin } = require('../middleware/auth');
const {
  getGarments,
  getGarmentById,
  createGarment,
  updateGarment,
  deleteGarment,
} = require('../controllers/garmentController');

const router = express.Router();

router.route('/').get(getGarments).post(protect, admin, createGarment);

router
  .route('/:id')
  .get(getGarmentById)
  .put(protect, admin, updateGarment)
  .delete(protect, admin, deleteGarment);

module.exports = router;
