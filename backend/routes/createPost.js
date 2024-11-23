const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");

// Route: Get all posts
router.get("/allposts", requireLogin, async (req, res) => {
    try {
        const posts = await POST.find()
            .populate("postedBy", "_id name Photo")
            .populate("comments.postedBy", "_id name")
            .sort("-createdAt");
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

// Route: Create a post
router.post("/createPost", requireLogin, async (req, res) => {
    const { body, pic } = req.body;

    if (!body || !pic) {
        return res.status(422).json({ error: "Please add all fields" });
    }

    try {
        const post = new POST({
            body,
            photo: pic,
            postedBy: req.user,
        });

        const result = await post.save();
        res.json({ post: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create post" });
    }
});

// Route: Get user's posts
router.get("/myposts", requireLogin, async (req, res) => {
    try {
        const myposts = await POST.find({ postedBy: req.user._id })
            .populate("postedBy", "_id name")
            .populate("comments.postedBy", "_id name")
            .sort("-createdAt");
        res.json(myposts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch your posts" });
    }
});

// Route: Like a post
router.put("/like", requireLogin, async (req, res) => {
    try {
        const result = await POST.findByIdAndUpdate(
            req.body.postId,
            { $push: { likes: req.user._id } },
            { new: true }
        ).populate("postedBy", "_id name photo");

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(422).json({ error: "Failed to like the post" });
    }
});

// Route: Unlike a post
router.put("/unlike", requireLogin, async (req, res) => {
    try {
        const result = await POST.findByIdAndUpdate(
            req.body.postId,
            { $pull: { likes: req.user._id } },
            { new: true }
        ).populate("postedBy", "_id name photo");

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(422).json({ error: "Failed to unlike the post" });
    }
});

// Route: Add a comment
router.put("/comment", requireLogin, async (req, res) => {
    const comment = {
        comment: req.body.text,
        postedBy: req.user._id,
    };

    try {
        const result = await POST.findByIdAndUpdate(
            req.body.postId,
            { $push: { comments: comment } },
            { new: true }
        )
            .populate("comments.postedBy", "_id name")
            .populate("postedBy", "_id name photo");

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(422).json({ error: "Failed to add comment" });
    }
});

// Route: Delete a post
router.delete("/deletePost/:postId", requireLogin, async (req, res) => {
    try {
        const post = await POST.findOne({ _id: req.params.postId })
            .populate("postedBy", "_id");

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.postedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await post.remove();
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete the post" });
    }
});

// Route: Get posts by followed users
router.get("/myfollowingpost", requireLogin, async (req, res) => {
    try {
        const posts = await POST.find({ postedBy: { $in: req.user.following } })
            .populate("postedBy", "_id name")
            .populate("comments.postedBy", "_id name")
            .sort("-createdAt");
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch following posts" });
    }
});

module.exports = router;
