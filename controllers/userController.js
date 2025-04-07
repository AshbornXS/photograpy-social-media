const UserService = require('../services/userService');
const PostService = require('../services/postService');

exports.followUser = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const followerId = req.session.user.id;
    const userId = req.params.id;

    await UserService.followUser(followerId, userId);
    res.redirect(`/user/${req.session.user.id}`);
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const followerId = req.session.user.id;
    const userId = req.params.id;

    await UserService.unfollowUser(followerId, userId);
    res.redirect(`/user/${req.session.user.id}`);
  } catch (error) {
    console.error('Erro ao deixar de seguir usuário:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const userProfile = await UserService.getUserProfile(userId);
    const userPosts = await PostService.getUserPosts(userId);
    const userAlbums = await PostService.getUserAlbums(userId);


    userProfile.seguidores = await UserService.getFollowersCount(userId);
    userProfile.seguindo = await UserService.getFollowingCount(userId);


    userProfile.isFollowing = req.session.user
      ? await UserService.isUserFollowing(req.session.user.id, userId)
      : false;


    const isOwnProfile = req.session.user && req.session.user.id === parseInt(userId);

    if (isOwnProfile) {
      res.render('profile', {
        user: { ...req.session.user, seguidores: userProfile.seguidores, seguindo: userProfile.seguindo },
        posts: userPosts,
        albums: userAlbums,
        hashtags: []
      });
    } else {
      res.render('userProfile', {
        userProfile,
        userPosts,
        userAlbums,
        user: req.session.user || null
      });
    }
  } catch (error) {
    console.error('Erro ao carregar perfil do usuário:', error);
    res.status(500).send('Erro ao carregar perfil do usuário.');
  }
};
