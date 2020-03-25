const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

router.post('/', (req, res) => {
    Post.findOne({ _id: req.body.id }).then(post => {
        const newComment = new Comment({
            user: req.body.user,
            body: req.body.body
        });
        post.comments.push(newComment);
        post.save().then(savedPost => {
            newComment.save().then(savedComment => {
                req.flash('success_message', 'Your comment will be reviewed');
                res.redirect(`/post/${post.slug}`);
            });
        });
    });
});

module.exports = router;
