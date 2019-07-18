const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// load validation
const validateProfileInput = require('../../validation/profile');

// load profile model
const Profile = require('../../models/Profile');

// load user model
const User = require('../../models/User');

// @route     GET api/profile/test
// @des       test profile router
// @access    Public
router.get('/test', (req, res) => res.json ({msg: 'Profile Works'}));

// @route     GET api/profile/all
// @des       Get all profiles
// @access    Public
router.get('/all', (req, res) => {
  const errors = {};
  Profile.find()
  .populate('user', ['name', 'avatar'])
  .then(profiles => {
    if(!profiles){
      errors.noprofile = 'There are no profiles';
      return res.status(404).json(errors);
    }
    res.json(profiles);
  })
  .catch (err =>
    res.status(404).json ({profile: 'There are not profiles'})
  );
});

// @route     GET api/profile/handle/:handle
// @des       Get profile by handle
// @access    Public
router.get('/handle/:handle', (req, res) => {
  const errors ={};
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.nopropfile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route     GET api/profile/user/:user_id
// @des       Get profile by user ID
// @access    Public
router.get('/user/:user_id', (req, res) => {
  const errors ={};
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.nopropfile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({profile: 'There is no profile for this user'}));
});









// @route     POST api/profile
// @des       Create or edit users profile
// @access    Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const{errors, isValid } = validateProfileInput(req.body);

  // check validation
  if(!isValid){
    // return any errors with 400 status
    return res.status(400).json(errors);
  }

  // Get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.website) profileFields.website = req.body.website;
  if(req.body.location) profileFields.location = req.body.location;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.status) profileFields.status = req.body.status;
  if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

  // skills - split into arrays
  if(typeof req.body.skills !== 'undefined') {profileFields.skills = req.body.skills.split(',');}

  // Social
  profileFields.social = {};
  if(req.body.youtube) profileFields.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.twitter = req.body.twitter;
  if(req.body.facebook) profileFields.facebook = req.body.facebook;
  if(req.body.linkin) profileFields.linkin = req.body.linkin;
  if(req.body.instagram) profileFields.instagram = req.body.instagram;

  Profile.findOne({ user: req.user.id })
  .populate('user',['name', 'avatar'])
  .then(profile => {
    if(profile){
    // update the profile
    profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true }
      )
      .then(profile => res.json(profile));
    } else {
    // Create

    // Check to see if Handle exists
    Profile.findOne({ handle: profileFields.handle })
    .then(profile => {
    if(profile) {
      errors.handle = 'That handle already exists';
      res.status(400).json(errors);
    }
    
    // Save profile
    new Profile(profileFields).save().then(profile => res.json(profile));
    });
  }
  });
  }
);

module.exports = router;