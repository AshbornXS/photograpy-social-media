const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const authJwt = require('../middlewares/authJwt');

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/posts');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const postUpload = multer({ storage: postStorage });

router.post('/create', authJwt, postUpload.single('image'), postController.createPost);
router.get('/feed', authJwt, postController.getFeed);
router.delete('/:id', authJwt, postController.deletePost);
router.get('/:id', authJwt, postController.getPostById);
router.put('/:id', authJwt, postUpload.single('image'), postController.updatePost);
router.post('/album/create', authJwt, postUpload.array('images', 10), postController.createAlbum);
router.post('/albums/edit/:id', authJwt, postUpload.array('images', 10), postController.updateAlbum);
router.post('/albums/delete/:id', authJwt, postController.deleteAlbum);
router.get('/albums/:id', authJwt, postController.getAlbumById);
router.post('/notifications/create', authJwt, postController.createNotification);
router.get('/notifications/:id', authJwt, postController.getNotifications);
router.post('/notifications/:id/read', authJwt, postController.markNotificationAsRead);
router.post('/like/:id', authJwt, postController.likePost);
router.post('/unlike/:id', authJwt, postController.unlikePost);
router.post('/comment/:id', authJwt, postController.addComment);
router.put('/comment/:id', authJwt, postController.editComment);
router.delete('/comment/:id', authJwt, postController.deleteComment);
router.get('/comments/:id', authJwt, postController.getComments);

router.post('/follow/:id', authJwt, userController.followUser);
router.post('/unfollow/:id', authJwt, userController.unfollowUser);
router.get('/user/:id', authJwt, userController.getUserProfile);

module.exports = router;
