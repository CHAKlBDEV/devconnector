const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');

const router = express.Router();

const auth = require('./../../middleware/auth');
const User = require('./../../models/User');

// @route GET api/auth
// @desc test endpoint for auth route
// @access Public
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user).select('-password');
		res.json(user);
	} catch (err) {
		console.log(err);
		res.status(500).send('Server Error');
	}
});

// @route POST api/auth
// @desc login user
// @access Public
router.post(
	'/',
	[
		check('email', 'Email is invalid').isEmail(),
		check('password', 'Password not valid').isLength(6)
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (!user) {
				return res.status(400).json({ msg: 'Wrong email/password' });
			}

			const isMatch = bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res.status(400).json({ msg: 'Wrong email/password' });
			}

			const payload = {
				user: user.id
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{
					expiresIn: 36000
				},
				(err, token) => {
					if (err) throw err;
					res.status(201).json({ token });
				}
			);
		} catch (err) {
			console.log(err);
			res.status(500).send('Server Error');
		}
	}
);
module.exports = router;
