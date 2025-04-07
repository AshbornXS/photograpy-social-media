const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const postRoutes = require('./postRoutes');
const userController = require('../controllers/userController');


router.use('/auth', authRoutes);


router.use('/posts', postRoutes);


router.get('/user/:id', userController.getUserProfile);


router.post('/user/follow/:id', userController.followUser);
router.post('/user/unfollow/:id', userController.unfollowUser);


router.get('/', (req, res) => {
  res.redirect('/posts/feed');
});

module.exports = router;
