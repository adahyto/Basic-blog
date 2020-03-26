const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const showdown = require('showdown');

converter = new showdown.Converter();

router.all('/*', (req, res, next) => {
  req.app.locals.layout = 'home';
  next();
});

router.get('/', (req, res) => {
  const perPage = 5;
  const page = req.query.page || 1;
  Post.find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .populate('user')
    .lean()
    .then(posts => {
      Post.count().then(postCount => {
        res.render('home/index', {
          posts,
          current: parseInt(page),
          pages: Math.ceil(postCount / perPage)
        });
      });
    });
});

router.get('/post/:slug', (req, res) => {
  Post.findOne({ slug: req.params.slug })
    .populate({ path: 'comments', match: { approveComment: true }, })
    .populate('user')
    .lean()
    .then(post => {
      res.render('home/post', { post: { ...post, body: converter.makeHtml(post.body) } });
    });
});

router.get('/tag/:tag', (req, res) => {
  const perPage = 5;
  const page = req.query.page || 1;
  Post.find({ tags: req.params.tag })
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .populate('user')
    .lean()
    .then(posts => {
      Post.count().then(postCount => {
        res.render('home/index', {
          posts,
          current: parseInt(page),
          pages: Math.ceil(postCount / perPage)
        });
      });
    });
});

router.get('/about', (req, res) => {
  res.render('home/about');
});

router.get('/login', (req, res) => {
  res.render('home/login');
});

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  console.log(email);
  User.findOne({ email: email }).then(user => {
    if (!user) return done(null, false, { message: 'No user found' });
    bcrypt.compare(password, user.password, (err, matched) => {
      if (err) return err;
      if (matched) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'wrong password' });
      }
    });
  });
}));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

module.exports = router;
