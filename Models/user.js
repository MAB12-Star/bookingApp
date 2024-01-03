const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  position: {
    type: Number,
    default: 1, // Start with position 1 for new users
    unique: true,
  },
});

// Before saving a new document, assign a sequence number
UserSchema.pre('save', async function (next) {
  if (this.isNew) {
    const latestUser = await this.constructor.findOne({}, { position: 1 }, { sort: { position: -1 } });

    // If there are no users yet, start with position 1, otherwise increment the latest position
    this.position = latestUser ? latestUser.position + 1 : 1;
  }

  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
