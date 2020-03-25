const express = require('express');
const router = express.Router();
const fs = require('fs');
const Post = require('../../models/Post');
const { isEmpty, uploadDir } = require('../../helpers/upload-helper');
const { userAuthenticated } = require('../../helpers/authentication.js');

router.all('/*', userAuthenticated, (req, res, next) => {
  req.app.locals.layout = 'admin';
  next();
});

router.get('/', (req, res) => {
  Post.find({})
    .then(posts => {
      res.render('admin/posts', { posts });
    });
});

router.get('/create', (req, res) => {
  res.render('admin/posts/create');
});

router.post('/create', (req, res) => {
  var filename = '';
  if (!isEmpty(req.files)) {
    let file = req.files.file;
    filename = Date.now() + '-' + file.name;
    file.mv(`${__dirname}/../../public/uploads/${filename}`, (err) => {
      if (err) throw err;
    });
  } else { console.log('empty'); }
  console.log(req.files);
  let allowComments = true;
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }
  const newPost = new Post({
    user: req.user.id,
    title: req.body.title,
    allowComments: allowComments,
    short: req.body.short,
    body: req.body.body,
    file: filename
  });
  newPost.save()
    .then(savedPost => {
      res.redirect('/admin/posts');
    }).catch(error => {
      console.log(error, 'could not save the post');
    });
});

router.get('/edit/:id', (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then(post => {
      res.render('admin/posts/edit', { post });
    });
});
router.put('/edit/:id', (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then(post => {
      if (req.body.allowComments) {
        allowComments = true;
      } else {
        allowComments = false;
      }
      post.user = req.user.id;
      post.title = req.body.title;
      post.allowComments = allowComments;
      post.body = req.body.body;
      post.short = req.body.short;
      if (!isEmpty(req.files)) {
        let file = req.files.file;
        filename = Date.now() + '-' + file.name;
        post.file = filename;
        file.mv(`${__dirname}/../../public/uploads/${filename}`, (err) => {
          if (err) throw err;
        });
      }
      post.save()
        .then(updatedPost => {
          res.redirect('/admin/posts');
        });
    });
});

router.delete('/:id', (req, res) => {
  Post.findOne({ _id: req.params.id })
    .populate('comments')
    .then(post => {
      fs.unlink(uploadDir + post.file, (err) => {
        if (!post.comments.length < 1) {
          post.comments.forEach(comment => {
            comment.remove();
          });
        }
        post.remove().then(postRemoved => {
          req.flash('success_message', `Post "${post.title}" was deleted successfully`);
          res.redirect('/admin/posts');
        });
      });
    });
});

module.exports = router;
