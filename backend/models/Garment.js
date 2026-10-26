const mongoose = require('mongoose');

const GARMENT_TYPES = [
  't-shirt',
  'hoodie',
  'jacket',
  'dress',
  'trousers',
  'skirt',
  'jeans',
  'jumpsuit',
  'coat',
  'shorts',
];

const garmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    type: { type: String, enum: GARMENT_TYPES, required: true, index: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }],
    colors: [{ type: String }],
    // Path to the high-res texture used for mapping onto the 3D avatar mesh
    textureUrl: { type: String, required: true },
    // Path to a low-poly / mesh reference used by the Three.js loader
    modelUrl: { type: String },
    thumbnailUrl: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

garmentSchema.index({ name: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Garment', garmentSchema);
module.exports.GARMENT_TYPES = GARMENT_TYPES;
