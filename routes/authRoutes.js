const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');


const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/pictures'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const profileUpload = multer({ storage: profileStorage });


router.get('/', postController.getFeed);


router.get('/profile', postController.getUserPosts);
router.post('/profile/edit/:id', postController.updatePost);
router.post('/profile/delete/:id', postController.deletePost);


router.get('/register', authController.registerPage);


router.get('/login', authController.loginPage);


router.post('/register', authController.register);


router.post('/login', authController.login);


router.get('/logout', authController.logout);

router.post('/profile/edit', profileUpload.single('foto_perfil'), authController.updateProfile);

router.post('/follow/:id', authController.followUser);
router.post('/unfollow/:id', authController.unfollowUser);

router.post('/change-password', authController.changePassword);

module.exports = router;
