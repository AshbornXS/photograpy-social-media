const UserRepository = require('../repositories/userRepository');

class UserService {
  static async followUser(followerId, userId) {
    try {
      await UserRepository.followUser(followerId, userId);
    } catch (error) {
      console.error('Erro ao seguir usuário no serviço:', error);
      throw error;
    }
  }

  static async unfollowUser(followerId, userId) {
    try {
      await UserRepository.unfollowUser(followerId, userId);
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário no serviço:', error);
      throw error;
    }
  }

  static async getUserProfile(userId) {
    try {
      return await UserRepository.getUserProfile(userId);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário no serviço:', error);
      throw error;
    }
  }

  static async getUserPosts(userId) {
    try {
      return await UserRepository.getUserPosts(userId);
    } catch (error) {
      console.error('Erro ao buscar postagens do usuário no serviço:', error);
      throw error;
    }
  }

  static async getFollowersCount(userId) {
    try {
      return await UserRepository.getFollowersCount(userId);
    } catch (error) {
      console.error('Erro ao buscar contagem de seguidores:', error);
      throw error;
    }
  }

  static async getFollowingCount(userId) {
    try {
      return await UserRepository.getFollowingCount(userId);
    } catch (error) {
      console.error('Erro ao buscar contagem de seguindo:', error);
      throw error;
    }
  }

  static async isUserFollowing(followerId, userId) {
    try {
      return await UserRepository.isUserFollowing(followerId, userId);
    } catch (error) {
      console.error('Erro ao verificar se o usuário está seguindo:', error);
      throw error;
    }
  }
}

module.exports = UserService;
