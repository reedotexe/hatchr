const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  otp: {
    code: { type: String, default: null },
    expiresAt: { type: Date, default: null }
  },
  isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

UserSchema.index({ 'otp.expiresAt': 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('User', UserSchema);
