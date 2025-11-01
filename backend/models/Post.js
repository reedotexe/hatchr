const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  caption: { type: String, default: '' },
  mediaUrl: { type: String, required: true },
  contentType: { type: String }, // Store mime type of the media
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  type: {
    type: String,
    enum: ['update', 'announcement', 'milestone'],
    default: 'update'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Post', PostSchema);
