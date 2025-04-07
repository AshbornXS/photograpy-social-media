const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const PostRepository = require('../repositories/postRepository');


const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/posts');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const postUpload = multer({ storage: postStorage });


router.post('/create', postUpload.single('image'), postController.createPost);
router.get('/feed', postController.getFeed);
router.post('/delete/:id', postController.deletePost);
router.get('/hashtag', postController.getPostsByHashtag);
router.get('/:id', postController.getPostById);
router.post('/edit/:id', postUpload.single('image'), postController.updatePost);
router.post('/album/create', postUpload.array('images', 10), postController.createAlbum);
router.post('/albums/edit/:id', postUpload.array('images', 10), postController.updateAlbum);
router.post('/albums/delete/:id', postController.deleteAlbum);
router.get('/albums/:id', postController.getAlbumById);
router.post('/notifications/create', postController.createNotification);
router.get('/notifications/:id', postController.getNotifications);
router.post('/notifications/:id/read', postController.markNotificationAsRead);
router.post('/like/:id', postController.likePost);
router.post('/unlike/:id', postController.unlikePost);
router.post('/comment/:id', postController.addComment);
router.post('/comment/edit/:id', postController.editComment);
router.post('/comment/delete/:id', postController.deleteComment);
router.get('/comments/:id', postController.getComments);


router.post('/follow/:id', userController.followUser);
router.post('/unfollow/:id', userController.unfollowUser);
router.get('/user/:id', userController.getUserProfile);

module.exports = router;
