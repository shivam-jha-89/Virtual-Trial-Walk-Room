/**
 * Seeds the database with 200+ demo garments across all supported types.
 * Usage: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Garment = require('../models/Garment');
const { GARMENT_TYPES } = require('../models/Garment');

const COLORS = ['black', 'white', 'navy', 'charcoal', 'olive', 'burgundy', 'beige', 'denim-blue'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BRANDS = ['Nordic Thread', 'Urban Fold', 'Studio Weft', 'Basecamp Co.', 'Meridian Wear'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomSubset = (arr, count) =>
  [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

const generateGarments = (countPerType = 22) => {
  const garments = [];
  GARMENT_TYPES.forEach((type) => {
    for (let i = 1; i <= countPerType; i += 1) {
      const brand = randomItem(BRANDS);
      garments.push({
        name: `${brand} ${type.charAt(0).toUpperCase() + type.slice(1)} ${i}`,
        brand,
        type,
        description: `A versatile ${type} designed for everyday wear, rendered for virtual try-on.`,
        price: Math.round((20 + Math.random() * 180) * 100) / 100,
        sizes: randomSubset(SIZES, 3 + Math.floor(Math.random() * 3)),
        colors: randomSubset(COLORS, 2 + Math.floor(Math.random() * 3)),
        textureUrl: `/uploads/textures/${type}-${i}.jpg`,
        modelUrl: `/uploads/models/${type}-${i}.glb`,
        thumbnailUrl: `/uploads/thumbnails/${type}-${i}.jpg`,
        stock: Math.floor(Math.random() * 100),
        tags: [type, brand.toLowerCase().replace(/\s+/g, '-')],
      });
    }
  });
  return garments;
};

const seed = async () => {
  await connectDB();
  const garments = generateGarments();

  await Garment.deleteMany({});
  await Garment.insertMany(garments);

  console.log(`Seeded ${garments.length} garments across ${GARMENT_TYPES.length} types.`);
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
