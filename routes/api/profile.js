const express = require('express');
const router = express.Router();
const mongoose = require ('mongoose');
const passport = require ('passport');

// load profile model
const Profile = require('../../models/Profile');

// load user model
const User = require('../../models/User');

// @routes    GET api/profile/test
// @des       test profile router
// @access    Public
router.get('/test', (req, res) => res.json ({msg: 'Profile Works'}));

// @routes    GET api/profile
// @des       get current users profile
// @access    Private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.use.id })
  .then(profile => {
    if(!profile){
      errors.noprofile = 'There is no profile for this user';
      return res.status(404).json(errors);
    }
    res.json(profile);
  })
  .catch(err => res.status(404).json(err))
});


module.exports = router;