const UserService = require('../services/userService');
const PostService = require('../services/postService');

exports.followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const userId = req.params.id;
    await UserService.followUser(followerId, userId);
    res.json({ message: 'Agora você está seguindo este usuário.' });
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    res.status(500).json({ message: 'Erro ao seguir usuário' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const userId = req.params.id;
    await UserService.unfollowUser(followerId, userId);
    res.json({ message: 'Você deixou de seguir este usuário.' });
  } catch (error) {
    console.error('Erro ao deixar de seguir usuário:', error);
    res.status(500).json({ message: 'Erro ao deixar de seguir usuário' });
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

    // Verifica se o usuário autenticado está seguindo este perfil
    let isFollowing = false;
    let isOwnProfile = false;
    if (req.user && req.user.id) {
      isFollowing = await UserService.isUserFollowing(req.user.id, userId);
      isOwnProfile = req.user.id === parseInt(userId);
    }

    res.json({
      userProfile: {
        ...userProfile,
        seguidores: userProfile.seguidores,
        seguindo: userProfile.seguindo,
        isFollowing,
        isOwnProfile
      },
      posts: userPosts,
      albums: userAlbums
    });
  } catch (error) {
    console.error('Erro ao carregar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro ao carregar perfil do usuário.' });
  }
};
