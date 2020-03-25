const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const { userAuthenticated } = require('../../helpers/authentication.js');

router.all('/*', userAuthenticated, (req, res, next) => {
  req.app.locals.layout = 'admin';
  next();
});

router.get('/', (req, res) => {
  Comment.find()
    .lean()
    .then(comments => {
      res.render('admin/comments', { comments });
    });
});

router.delete('/:id', (req, res) => {
  Comment.remove({ _id: req.params.id }).then(result => {
    Post.findOneAndUpdate({ comments: req.params.id }, { $pull: { comments: req.params.id } }, (err, data) => {
      if (err) console.log(err);
      res.redirect('/admin/comments/my-comments');
    });
  });
});

router.post('/approve-comment', (req, res) => {
  Comment.findByIdAndUpdate(req.body.id, { $set: { approveComment: req.body.approveComment } }, (err, result) => {
    if (err) return err;
    res.redirect('/admin/comments');
  });
});

module.exports = router;
