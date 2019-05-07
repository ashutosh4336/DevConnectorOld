const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const { check, validationResult } = require('express-validator/check');

// Load User Models
const User = require('../../models/User');

// @route  POST api/users
// @desc   Register user
// @access Public
router.post(
  '/',
  [
    check('name', 'Name is Required')
      .not()
      .isEmpty(),
    check('email', 'Please Enter a Valid Email').isEmail(),
    check(
      'password',
      'Please Enter a Password with Minimum Length of 6'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // console.log(req.body);
    const { name, email, password } = req.body;

    try {
      //See If Users Exits
      let user = await User.findOne({ email });

      if (user) {
        res.ststus(400).json({ errors: [{ msg: 'User already Exits' }] });
      }

      //Get Users Gravatar

      //Encrypt the Password

      //Return JSONWEBTOKEN

      res.send('User Route');
    } catch (err) {
      console.err(err.meassge);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
