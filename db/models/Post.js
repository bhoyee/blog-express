const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    content: String,
    author: String,
    image: String,
    createdAt: {
        type: Date,
       
        default: Date.now
    }
})

const Post = mongoose.model('Post', postSchema);

module.exports.Post = Post;