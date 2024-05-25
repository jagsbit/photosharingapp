const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    desc: {
        type: String,
        required: true
    },
    image:{
        type:String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' 
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes:{
        type:Array,
        default:[]
    }
});

module.exports = mongoose.model('post', PostSchema);