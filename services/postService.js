const PostRepository = require('../repositories/postRepository');
const UserRepository = require('../repositories/userRepository');

class PostService {
  static async createPost(postData) {
    try {
      const postId = await PostRepository.create(postData);

      if (postData.arquivo_foto) {
        const fotoData = {
          publicacao_id: postId,
          arquivo_foto: postData.arquivo_foto,
          descricao: postData.legenda
        };
        await PostRepository.addFoto(fotoData);
      }

      if (postData.hashtags) {
        const hashtags = postData.hashtags.split(',').map(tag => tag.trim());
        const hashtagIds = await PostService.ensureHashtagsExist(hashtags);
        await PostRepository.addHashtags(postId, hashtagIds);
      }


      const user = await UserRepository.getUserProfile(postData.usuario_id);


      const seguidores = await UserRepository.getFollowers(postData.usuario_id);
      for (const seguidor of seguidores) {
        const notificationData = {
          usuario_id: seguidor.seguidor_id,
          tipo: 'Nova Postagem',
          mensagem: `O usuário ${user.nome} postou algo novo.`
        };
        await PostRepository.createNotification(notificationData);
      }
    } catch (error) {
      console.error('Erro ao criar post no serviço:', error);
      throw error;
    }
  }

  static async ensureHashtagsExist(hashtags) {
    try {
      const existingHashtags = await PostRepository.findHashtagsByName(hashtags);
      const existingHashtagNames = existingHashtags.map(h => h.nome);
      const newHashtags = hashtags.filter(tag => !existingHashtagNames.includes(tag));

      if (newHashtags.length > 0) {
        await PostRepository.createHashtags(newHashtags);
      }

      const allHashtags = await PostRepository.findHashtagsByName(hashtags);
      return allHashtags.map(h => h.id);
    } catch (error) {
      console.error('Erro ao verificar/criar hashtags:', error);
      throw error;
    }
  }

  static async getAllPosts(callback) {
    try {

      const posts = await new Promise((resolve, reject) => {
        PostRepository.findAll((err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });


      const albums = await new Promise((resolve, reject) => {
        PostRepository.findAllAlbums((err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });


      const feed = [...posts, ...albums].sort((a, b) => new Date(b.data_publicacao || b.data_criacao) - new Date(a.data_publicacao || a.data_criacao));

      callback(null, feed);
    } catch (error) {
      console.error('Erro ao buscar posts e álbuns no serviço:', error);
      callback(error);
    }
  }

  static async getUserPosts(userId) {
    try {
      const posts = await PostRepository.findByUserId(userId);
      return posts;
    } catch (error) {
      console.error('Erro ao buscar posts do usuário no serviço:', error);
      throw error;
    }
  }

  static async getUserAlbums(userId) {
    try {
      const albums = await PostRepository.findAlbumsByUserId(userId);
      return albums;
    } catch (error) {
      console.error('Erro ao buscar álbuns do usuário no serviço:', error);
      throw error;
    }
  }

  static deletePost(postId, callback) {
    PostRepository.deleteById(postId, callback);
  }

  static async updatePost(postId, data) {
    try {

      await PostRepository.updateById(postId, data);


      if (data.arquivo_foto) {
        await PostRepository.updatePhoto(postId, data.arquivo_foto, data.legenda);
      }


      if (data.hashtags) {
        const hashtags = data.hashtags.split(',').map(tag => tag.trim());
        const hashtagIds = await PostService.ensureHashtagsExist(hashtags);


        await PostRepository.updatePostHashtags(postId, hashtagIds);
      }
    } catch (error) {
      console.error('Erro ao atualizar postagem no serviço:', error);
      throw error;
    }
  }

  static getPostsByHashtag(hashtags, callback) {
    PostRepository.findByHashtag(hashtags, callback);
  }

  static getAllHashtags() {
    return new Promise((resolve, reject) => {
      PostRepository.findAllHashtags((err, hashtags) => {
        if (err) return reject(err);
        resolve(hashtags);
      });
    });
  }

  static getPostById(postId, callback) {
    PostRepository.findById(postId, (err, post) => {
      if (err) {
        console.error('Erro ao buscar postagem no serviço:', err);
        return callback(err);
      }
      callback(null, post);
    });
  }

  static async createAlbum(albumData) {
    try {

      const albumId = await PostRepository.createAlbum(albumData);


      if (albumData.fotos && albumData.fotos.length > 0) {

        const fotos = await Promise.all(
          albumData.fotos.map(async (foto) => {
            const fotoData = {
              publicacao_id: null,
              arquivo_foto: foto.arquivo_foto,
              descricao: foto.descricao || null
            };
            const fotoId = await PostRepository.addFoto(fotoData);
            return { album_id: albumId, foto_id: fotoId };
          })
        );


        await PostRepository.addPhotosToAlbum(fotos);
      }

      const user = await UserRepository.getUserProfile(albumData.usuario_id);

      const seguidores = await UserRepository.getFollowers(albumData.usuario_id);
      for (const seguidor of seguidores) {
        const notificationData = {
          usuario_id: seguidor.seguidor_id,
          tipo: 'Novo Álbum',
          mensagem: `O usuário ${user.nome} postou um álbum novo.`
        };
        await PostRepository.createNotification(notificationData);
      }

      return albumId;
    } catch (error) {
      console.error('Erro ao criar álbum no serviço:', error);
      throw error;
    }
  }

  static async addPhotosToAlbum(fotos) {
    try {

      const fotosComIds = await Promise.all(
        fotos.map(async (foto) => {
          const fotoData = {
            publicacao_id: null,
            arquivo_foto: foto.arquivo_foto,
            descricao: foto.descricao || null
          };
          const fotoId = await PostRepository.addFoto(fotoData);
          return { album_id: foto.album_id, foto_id: fotoId };
        })
      );


      await PostRepository.addPhotosToAlbum(fotosComIds);
    } catch (error) {
      console.error('Erro ao adicionar fotos ao álbum no serviço:', error);
      throw error;
    }
  }

  static async updateAlbum(albumId, albumData) {
    try {
      await PostRepository.updateAlbum(albumId, albumData);
    } catch (error) {
      console.error('Erro ao atualizar álbum no serviço:', error);
      throw error;
    }
  }

  static async updateAlbumPhotos(albumId, fotos) {
    try {

      await PostRepository.deletePhotosFromAlbum(albumId);


      const fotosAtualizadas = fotos.map(foto => ({
        album_id: albumId,
        arquivo_foto: foto
      }));
      await PostRepository.addPhotosToAlbum(fotosAtualizadas);
    } catch (error) {
      console.error('Erro ao atualizar fotos do álbum no serviço:', error);
      throw error;
    }
  }

  static async deleteAlbum(albumId) {
    try {
      await PostRepository.deleteAlbum(albumId);
    } catch (error) {
      console.error('Erro ao excluir álbum no serviço:', error);
      throw error;
    }
  }

  static getAlbumById(albumId, callback) {
    PostRepository.findAlbumById(albumId, (err, album) => {
      if (err) {
        console.error('Erro ao buscar álbum no serviço:', err);
        return callback(err);
      }
      callback(null, album);
    });
  }

  static async createNotification(notificationData) {
    try {
      const notificationId = await PostRepository.createNotification(notificationData);
      return notificationId;
    } catch (error) {
      console.error('Erro ao criar notificação no serviço:', error);
      throw error;
    }
  }

  static async getNotificationsByUserId(userId) {
    try {
      const notifications = await PostRepository.findNotificationsByUserId(userId);
      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações no serviço:', error);
      throw error;
    }
  }

  static async getUnreadNotificationsByUserId(userId) {
    try {
      const notifications = await PostRepository.findUnreadNotificationsByUserId(userId);
      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas no serviço:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId) {
    try {
      await PostRepository.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida no serviço:', error);
      throw error;
    }
  }

  static async likePost(userId, postId) {
    try {
      await PostRepository.likePost(userId, postId);
    } catch (error) {
      console.error('Erro ao curtir postagem no serviço:', error);
      throw error;
    }
  }

  static async unlikePost(userId, postId) {
    try {
      await PostRepository.unlikePost(userId, postId);
    } catch (error) {
      console.error('Erro ao descurtir postagem no serviço:', error);
      throw error;
    }
  }

  static async isPostLikedByUser(postId, userId) {
    try {
      return await PostRepository.isPostLikedByUser(postId, userId);
    } catch (error) {
      console.error('Erro ao verificar curtida no serviço:', error);
      throw error;
    }
  }

  static async addComment(commentData) {
    try {
      await PostRepository.addComment(commentData);
    } catch (error) {
      console.error('Erro ao adicionar comentário no serviço:', error);
      throw error;
    }
  }

  static async editComment(commentId, texto) {
    try {
      await PostRepository.updateComment(commentId, texto);
    } catch (error) {
      console.error('Erro ao editar comentário no serviço:', error);
      throw error;
    }
  }

  static async deleteComment(commentId) {
    try {
      await PostRepository.deleteComment(commentId);
    } catch (error) {
      console.error('Erro ao apagar comentário no serviço:', error);
      throw error;
    }
  }

  static async getCommentById(commentId) {
    try {
      return await PostRepository.getCommentById(commentId);
    } catch (error) {
      console.error('Erro ao buscar comentário no serviço:', error);
      throw error;
    }
  }

  static async getComments(postId) {
    try {
      const comments = await PostRepository.getComments(postId);
      return comments;
    } catch (error) {
      console.error('Erro ao buscar comentários no serviço:', error);
      throw error;
    }
  }

  static async getFeed(userId) {
    try {

      const posts = await PostRepository.findAll();


      const albums = await PostRepository.findAllAlbums();


      for (const post of posts) {
        post.isLiked = userId ? await PostRepository.isPostLikedByUser(post.id, userId) : false;
        post.isFollowing = userId ? await PostRepository.isUserFollowing(userId, post.usuario_id) : false;
        post.comentarios = await PostRepository.getComments(post.id) || [];
      }


      for (const album of albums) {
        album.isFollowing = userId ? await PostRepository.isUserFollowing(userId, album.usuario_id) : false;
      }


      const feed = [...posts, ...albums].sort((a, b) => {
        const dateA = new Date(a.data_publicacao || a.data_criacao);
        const dateB = new Date(b.data_publicacao || b.data_criacao);
        return dateB - dateA;
      });

      return feed;
    } catch (error) {
      console.error('Erro ao buscar feed no serviço:', error);
      throw error;
    }
  }

  static async getLikesCount(postId) {
    try {
      return await PostRepository.getLikesCount(postId);
    } catch (error) {
      console.error('Erro ao buscar número de curtidas:', error);
      throw error;
    }
  }
}

module.exports = PostService;
