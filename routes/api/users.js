const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('./../../models/User');

// @route POST api/users
// @desc register user
// @access Public
router.post(
	'/',
	[
		check('name', 'Name is required')
			.not()
			.isEmpty(),
		check('email', 'Email is invalid').isEmail(),
		check(
			'password',
			'Password must be at least 6 characters long'
		).isLength(6)
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (user) {
				return res.status(400).json({
					errors: [{ msg: 'User already exists' }]
				});
			}

			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});

			user = new User({
				name,
				email,
				password,
				avatar
			});

			const salt = await bcrypt.genSalt(10);

			user.password = await bcrypt.hash(password, salt);

			await user.save();

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
