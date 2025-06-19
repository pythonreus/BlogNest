const postModel = require("../models/postModel.js"); // load my postModel

// implement the functions
const getPosts = async (req,res) => {
    // basically getting all the posts, with some filtering applied and pagination
    console.log("received the request");
    try{
        const  { category,page = 1,limit = 10} = req.query;

        const query = {};

        if(category){
            query.post_category = category;
        }

        const posts = await postModel.find(query).sort({createdAt: -1}).skip ((page - 1) * limit).limit(parseInt(limit));
        const totalPosts = await postModel.countDocuments(query);

        return res.status(200).json({message:"Posts successfully retrieved",currentPage: page,totalPages: Math.ceil(totalPosts/limit),totalPosts,posts});

    }catch(error){
         return res.status(500).json({ message: "Internal Server Error when retrieving the posts" });
    }
};

const getPost = async (req,res) => {
    console.log("I am called");
    try{
        const post_id = req.params.post_id;

        const post = await postModel.findById(post_id);

        if(!post){
            return res.status(404).json({ message: "Post not found" });
        }
        console.log(post);
        return res.status(200).json({message:"Post successfully retrieved", post : post});

    }catch(error){
        return res.status(500).json({ message: "Internal Server Error when retrieving the post" });
    }

};

const updatePost = async (req,res) => {
    try{
        const post_id = req.params.post_id;
        const updateData = req.body;

        const updatedRecord = await postModel.findByIdAndUpdate(post_id,
            updateData,
            {new:true,runValidators:true}
        );

        if(!updatedRecord){
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json({message:"Post successfully updated", post:updatedRecord});
    }catch(error){
         return res.status(500).json({ message: "Internal Server Error when updating the post" });
    }

};

const updateVisibility = async (req,res) => {
    try{
        //get the id of the post
        const post_id = req.params.post_id;

        const post = await postModel.findById(post_id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        //check if the record exists or not and update it
        const postUpdate = await postModel.findByIdAndUpdate(post_id,
            { post_visibility: !post.post_visibility },
            {new:true,runValidators:true}
        );

        return res.status(200).json({message:"Post successfully updated",post : postUpdate});

    }catch(error){
        return res.status(500).json({ message: "Internal Server Error when updating the visibility" });
    }

};


const deletePost = async (req,res) => {
    try{
        const post_id = req.params.post_id;

        const deletedPost = await postModel.findByIdAndDelete(post_id);

        if(!deletedPost){
             return res.status(404).json({ message: "Post not found" });            
        }

        return res.status(200).json({message: "Post successfully deleted"});

    }catch(error){
        return res.status(500).json({ message: "Internal Server Error when deleting the post" });
    }

};

const createPost = async (req,res) => {
    try{
        //get the data fromt he requestbody
        const {post_title,post_author,post_category,post_content} = req.body;

        //check if the data is correct
        if(!post_title || !post_author || !post_category || !post_content){
            return res.status(400).json({message : "Bad Request, All fields are required"});
        }

        //by default we willsjust set visibility to false until we change it
        const newPost = new postModel({
            post_title,
            post_author,
            post_category,
            post_content,
            post_visibility: false
        });

        const savedPost = await newPost.save();

        return res.status(201).json({message:"Post successfully created", post: savedPost});

    }catch(error){
        return res.status(500).json({message: "Internal Server error when creating the post"});
    }

};


//exporting the functions
module.exports = { getPosts, getPost, updatePost, updateVisibility, deletePost, createPost};

