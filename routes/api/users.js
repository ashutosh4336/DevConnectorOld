const express = require('express');
const router = express.Router();
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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // console.log(req.body);
    const { name, email, password } = req.body;

    res.send('User Route');
  }
);

module.exports = router;
