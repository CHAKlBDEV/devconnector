const express = require('express');
const { check, validationResult } = require('express-validator');

const auth = require('./../../middleware/auth');
const User = require('./../../models/User');
const Post = require('./../../models/Post');

const router = express.Router();

// @route POST api/posts
// @desc Add new post
// @access Private
router.post(
	'/',
	[auth, [check('text', 'Text is required').notEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findOne({ _id: req.user }).select(
				'-password'
			);

			let newPost = {
				text: req.body.text,
				user: req.user,
				name: user.name,
				avatar: user.avatar
			};

			let post = new Post(newPost);

			post.save();

			return res.json(post);
		} catch (err) {
			return res.status(500).send('Server Error');
		}
	}
);

// @route GET api/posts/id
// @desc Get post by ID
// @access Private
router.get('/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findOne({ _id: req.params.post_id });
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		return res.json(post);
	} catch (err) {
		console.error(err);
		return res.status(500).send('Server Error');
	}
});

// @route GET api/posts
// @desc Get post by ID
// @access Private
router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort('-date');

		return res.json(posts);
	} catch (err) {
		console.error(err);
		return res.status(500).send('Server Error');
	}
});

// @route DELETE api/posts/id
// @desc Delete post by ID
// @access Private
router.delete('/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findOne({ _id: req.params.post_id });
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}
		if (post.user.toString() !== req.user) {
			return res.status(401).json({ msg: 'Unauthorized' });
		}
		await post.remove();
		return res.json({ msg: 'Post deleted' });
	} catch (err) {
		console.error(err);
		return res.status(500).send('Server Error');
	}
});

// @route PUT api/posts/like/id
// @desc Delete post by ID
// @access Private
router.put('/like/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findOne({ _id: req.params.post_id });

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		if (
			post.likes.filter(like => like.user.toString() === req.user)
				.length > 0
		) {
			return res.status(400).json({ msg: 'Post already liked' });
		}

		post.likes.unshift({ user: req.user });

		await post.save();
		return res.json(post.likes);
	} catch (err) {
		console.error(err);
		return res.status(500).send('Server Error');
	}
});

// @route PUT api/posts/like/id
// @desc Delete post by ID
// @access Private
router.put('/unlike/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findOne({ _id: req.params.post_id });

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		let removeIndex = post.likes
			.map(like => like.user.toString())
			.indexOf(req.user);

		if (removeIndex < 0) {
			return res.status(400).json({ msg: 'Post not liked' });
		}

		post.likes.splice(removeIndex, 1);

		await post.save();

		return res.json(post.likes);
	} catch (err) {
		console.error(err);
		return res.status(500).send('Server Error');
	}
});

module.exports = router;
