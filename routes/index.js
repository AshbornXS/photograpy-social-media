const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const postRoutes = require('./postRoutes');
const userController = require('../controllers/userController');
const authJwt = require('../middlewares/authJwt');

router.use('/auth', authRoutes);

router.use('/posts', postRoutes);

router.get('/user/:id', authJwt, userController.getUserProfile);
router.post('/user/follow/:id', authJwt, userController.followUser);
router.post('/user/unfollow/:id', authJwt, userController.unfollowUser);

module.exports = router;
