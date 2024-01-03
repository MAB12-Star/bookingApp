const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../Models/user.js'); // Adjust the path based on your file structure

const catchAsync = require('../utils/CatchAsync.js');

  router.get('/waitlist/:id', catchAsync(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.render("confirmation", { user });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }));
  
    router.post('/register', catchAsync(async (req, res) => {
    try {
      if(!req.body.email){
        res.render("home", { error: "Email cannot be empty"});
        return;
      }
      let foundUser = await User.findOne({ email: req.body.email});
      if (foundUser) {
        res.render("home", {error: "That email is already on the waitlist"});
        return;
      }
      const newUser = new User({ email: req.body.email });
      await newUser.save();
  
      // Redirect to a new route that displays the user's position
      res.redirect(`/waitlist/${newUser._id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }));

  module.exports = router;