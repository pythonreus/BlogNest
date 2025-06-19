const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const blogSchema = new Schema({
    post_title: {
        type: String,
        required: true
    },
    post_author: {
        type: String,
        required : true
    },
    post_category: {
        type : String,
        reuired: true
    },
    post_content:{
        type: String,
        required: true
    },
    post_visibility: {
        type: Boolean,
        required: true
    },

}, {timestamps : true});

const BlogPost = mongoose.model("BlogPost",blogSchema);

module.exports = BlogPost;