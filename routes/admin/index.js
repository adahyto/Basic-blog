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
  const promises = [
    Post.count().exec(),
    Comment.count().exec(),
  ];
  Promise.all(promises).then(([postCount, commentCount]) => {
    res.render('admin/index', { postCount, commentCount });
  });
});


module.exports = router;
