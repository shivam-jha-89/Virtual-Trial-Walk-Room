const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const measurementSchema = new mongoose.Schema(
  {
    heightCm: { type: Number, required: true },
    chestCm: { type: Number, required: true },
    waistCm: { type: Number, required: true },
    hipCm: { type: Number, required: true },
    shoulderWidthCm: { type: Number, required: true },
    inseamCm: { type: Number, required: true },
    source: {
      type: String,
      enum: ['manual', 'pose-estimation'],
      default: 'manual',
    },
    capturedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    measurements: measurementSchema,
    avatarConfig: {
      bodyType: { type: String, default: 'average' },
      skinTone: { type: String, default: '#e0ac69' },
      gender: {
        type: String,
        enum: ['masculine', 'feminine', 'neutral'],
        default: 'neutral',
      },
    },
    savedLooks: [
      {
        garment: { type: mongoose.Schema.Types.ObjectId, ref: 'Garment' },
        savedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
