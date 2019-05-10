const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const post = require('../../models/Post');
const profile = require('../../models/Profile');
const user = require('../../models/User');

// @route  POST api/posts
// @desc   Create a Post
// @access Private

router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is Required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  GET api/posts
// @desc   GET all a Post
// @access Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/posts/:id
// @desc   GET single Post by id
// @access Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post Not Found' });

    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId')
      return res.status(404).json({ msg: 'Post Not Found' });

    res.status(500).send('Server Error');
  }
});

// @route  DELETE api/posts/:id
// @desc   DELETE a Post
// @access Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: 'Post Not Found' });

    //Check on User
    if (post.user.toString() !== req.user.id)
      return res
        .status(401)
        .json({ msg: 'User Not Authorized to Delete The Post' });

    await post.remove();

    return res.json({ msg: 'Post Removed' });

    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId')
      return res.status(404).json({ msg: 'Post Not Found' });
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/posts/like/:id
// @desc   Like a Post
// @access Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check the post has already been liked by the user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Post Already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/posts/unlike/:id
// @desc   Unlike a Post
// @access Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check the post has already been liked by the user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      res.status(400).json({ msg: 'Post has Not Yet Been Liked' });
    }

    // post.likes.unshift({ user: req.user.id });
    //Get Remove Index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  POST api/posts/comment/:id
// @desc   Comment on a post
// @access Private

router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'Text is Required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  POST api/posts/comment/:id/:commmentid
// @desc   Delete a Comment
// @access Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //pullout comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    //check comment exist
    if (!comment) {
      return res.status(404).json({ msg: "Comment Doesn't Exist" });
    }

    //check the user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not Authorized' });
    }

    //find Index
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
