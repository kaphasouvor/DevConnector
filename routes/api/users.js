const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require ('passport');

// load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');


// load User model
const User = require('../../models/User');

// @routes    GET api/users/test
// @des       test users router
// @access    Public
router.get('/test', (req, res) => res.json ({msg: 'User Works'}));

// @routes    GET api/users/register
// @des       register users 
// @access    Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // check validation
  if(!isValid){
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
  .then(user => {
    if(user) {
      return res.status(404).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', // Size
        r: 'PG',   // Rating
        d: 'mm' // Default
      });
      const newUser = new User({
        name: req.body.name, 
        email: req.body.email,
        avatar,
        password: req.body.password
      }); 

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          newUser
          .save()
          .then (user => res.json(user))
          .catch (err => console.log(err));
        });
      });
    }
  });
});

  // @route   GET api/users/login
  // @desc    Login User / Returning JWT Token
  // @access  Public
router.post ('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // check validation
  if(!isValid){
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

// Find user by email
User.findOne({email})
.then(user => {
  // check for user
  if(!user) {
    errors.email = 'User not found';
    return res.status(404).json(errors);
  }

  // check password
  bcrypt.compare(password, user.password)
  .then(isMatch => {
    if (isMatch) {
      // User Matched
      
      // create jwt payload
      const payload = {
        id: user.id, 
        name: user.name, 
        avatar: user.avator
      }
      // Sign Token
      jwt.sign(
        payload, 
        keys.secretOrKey, 
        { expiresIn: 3600 }, 
        (err, token) => {
          res.json({
            success: true,
            token: 'Bearer ' + token
          });
      });
      } else {
        errors.password = 'Invalid password'
      return res.status(400).json(errors);
      }
    });
  });
});

  // @route   GET api/users/current
  // @desc    Return current user
  // @access  Private
router.get('/current', passport.authenticate('jwt', {session:false}), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  });
});

module.exports = router;