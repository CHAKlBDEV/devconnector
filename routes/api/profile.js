const express = require('express');
const { check, validationResult } = require('express-validator');
const request = require('request');

const auth = require('./../../middleware/auth');
const User = require('./../../models/User');
const Profile = require('./../../models/Profile');

const router = express.Router();

// @route GET api/profile/me
// @desc get current user profile
// @access private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res.status(400).json({ msg: 'This user has no profile' });
		}

		return res.json(profile);
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: 'Server Error' });
	}
});

// @route POST api/profile
// @desc Create or update profile
// @access Private
router.post(
	'/',
	[
		auth,
		[
			check('status', 'status is required').notEmpty(),
			check('skills', 'skills are required').notEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			location,
			website,
			bio,
			skills,
			status,
			githubusername,
			youtube,
			twitter,
			instagram,
			linkedin,
			facebook
		} = req.body;

		//Build profile object
		const profileFields = {};
		profileFields.user = req.user;
		if (company) profileFields.company = company;
		if (location) profileFields.location = location;
		if (website) profileFields.website = website;
		if (bio) profileFields.bio = bio;
		if (skills) {
			profileFields.skills = skills.split(',').map(skill => skill.trim());
		}
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;

		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (instagram) profileFields.social.instagram = instagram;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (facebook) profileFields.social.facebook = facebook;

		try {
			let profile = await Profile.findOne({ user: req.user });

			if (profile) {
				profile = await Profile.findOneAndUpdate(
					{ user: req.user },
					{ $set: profileFields },
					{ new: true }
				);

				return res.json(profile);
			}

			profile = new Profile(profileFields);
			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ msg: 'Server Error' });
		}
	}
);

// @route GET api/profile
// @desc get all profiles
// @access public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', [
			'name',
			'avatar'
		]);
		return res.json(profiles);
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: 'Server Error' });
	}
});

// @route GET api/profile/user/id
// @desc get all profiles
// @access public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res.status(404).json({ msg: 'Page not found' });
		}

		return res.json({ profile });
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: 'Server Error' });
	}
});

// @route DELETE api/profile/user/id
// @desc Deletes profile, user and posts
// @access Private
router.delete('/', auth, async (req, res) => {
	try {
		// @todo: remove posts

		// remove profile
		await Profile.findOneAndRemove({ user: req.user });

		// remove user
		await User.findOneAndRemove({ _id: req.user });

		return res.json({ msg: 'User deleted' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: 'Server Error' });
	}
});

// @route PUT api/profile/experience
// @desc Adds experience to users profile
// @access Private
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').notEmpty(),
			check('company', 'Company is required').notEmpty(),
			check('from', 'From date is required').notEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		} = req.body;

		let newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		};

		try {
			let profile = await Profile.findOne({ user: req.user });

			profile.experience.unshift(newExp);

			await profile.save();

			return res.json(profile);
		} catch (err) {
			console.log(err);
			res.status(500).send('Server Error');
		}
	}
);

// @route DELETE api/profile/user/experience/id
// @desc Deletes an experience
// @access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		let profile = await Profile.findOne({ user: req.user });

		const removeId = profile.experience
			.map(item => item.id)
			.indexOf(req.params.exp_id);
		profile.experience.splice(removeId, 1);

		await profile.save();

		return res.json({ msg: 'Experience deleted' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: 'Server Error' });
	}
});

// @route PUT api/profile/education
// @desc Adds education to users profile
// @access Private
router.put(
	'/education',
	[
		auth,
		[
			check('school', 'School is required').notEmpty(),
			check('degree', 'Degree is required').notEmpty(),
			check('fieldofstudy', 'Fieldofstudy is required').notEmpty(),
			check('from', 'From date is required').notEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description
		} = req.body;

		let newEd = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description
		};

		try {
			let profile = await Profile.findOne({ user: req.user });

			profile.education.unshift(newEd);

			await profile.save();

			return res.json(profile);
		} catch (err) {
			console.log(err);
			res.status(500).send('Server Error');
		}
	}
);

// @route DELETE api/profile/user/education/id
// @desc Deletes an education
// @access Private
router.delete('/education/:ed_id', auth, async (req, res) => {
	try {
		let profile = await Profile.findOne({ user: req.user });

		const removeId = profile.education
			.map(item => item.id)
			.indexOf(req.params.ed_id);
		profile.education.splice(removeId, 1);

		await profile.save();

		return res.json({ msg: 'Education deleted' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: 'Server Error' });
	}
});

// @route GET api/profile/github/gitid
// @desc Gets latest repositories of a user
// @access Public
router.get('/github/:github_username', async (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${req.params.github_username}/repos?per_page=5`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' }
		};
		request(options, (error, response, body) => {
			if (error) throw error;

			if (response.statusCode !== 200) {
				console.error(
					`Github server returned a ${response.statusCode}`
				);
				return res
					.status(404)
					.json({ msg: 'github profile not found' });
			}

			return res.json(JSON.parse(body));
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: 'Server Error' });
	}
});

module.exports = router;
