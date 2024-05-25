const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect("mongodb://127.0.0.1:27017/pintrest");

const userSchema = new Schema({
  name: { 
     type: String,
     required: true, 
     },
  email: {
    type: String,
    required: true, 
    unique: true },
  password: { 
    type: String,
    required: true },
  profileImage: { 
    type: String, 
    default: 'dfe7be90-1e8e-41fc-953c-776aa6091399.png' },
  bio: { 
    type: String, 
    default: '' },
  boards: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'post' }],
  posts: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'post' }],
  createdPins: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Pin' }],
  likedPins: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Pin' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
