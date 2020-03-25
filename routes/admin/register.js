const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { userAuthenticated } = require('../../helpers/authentication.js');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    res.render('admin/register');
});

router.post('/', (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                const newUser = new User({
                    nickName: req.body.nickName,
                    email: req.body.email,
                    password: req.body.password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser.save().then(savedUser => {
                            res.redirect('/login');
                        });
                    });
                });
            }
        });

});

module.exports = router;
