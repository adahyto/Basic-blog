const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  nickName: {
    type: String,
    required: true
  },
  email: {
    type: String,
  },
  password: {
    type: String
  }
});

module.exports = mongoose.model('users', UserSchema);
