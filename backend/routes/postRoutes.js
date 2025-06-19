const express = require("express"); // load the express library
const router = express.Router(); // this allows us to define and use routes
const {getPosts, getPost, updatePost, updateVisibility, deletePost, createPost} = require('../controllers/postController.js');

//router is basically like a mini app
router.get('/', getPosts); // get all the posts in paginated format
router.get('/:post_id', getPost); // get a single post
router.put('/:post_id', updatePost); // update a post
router.put('/:post_id/visibility', updateVisibility); // updating if the psot should be visible or not
router.delete('/:post_id', deletePost); // deleting a post based on the id
router.post('/', createPost); // creating a new post

//now i have to export the router so that it can be used elsewhere
module.exports = router;