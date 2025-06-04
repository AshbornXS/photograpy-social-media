const PostService = require('../services/postService');
const path = require('path');
const fs = require('fs');

exports.createPost = async (req, res) => {
  try {
    const postData = {
      usuario_id: req.user.id,
      legenda: req.body.legenda,
      localizacao: req.body.localizacao || null,
      hashtags: req.body.hashtags || null,
      arquivo_foto: req.file ? `/uploads/posts/${req.file.filename}` : null
    };
    await PostService.createPost(postData);
    res.status(201).json({ message: 'Post criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(500).json({ message: 'Erro ao criar post' });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const { hashtags, localizacao, usuario_id } = req.query;
    const filters = {};
    if (hashtags) filters.hashtags = hashtags.split(',').map(tag => tag.trim());
    if (localizacao) filters.localizacao = localizacao;
    if (usuario_id) filters.usuario_id = usuario_id;
    const feed = await PostService.getFeed(req.user.id, filters);
    res.json({ feed });
  } catch (error) {
    console.error('Erro ao buscar feed:', error);
    res.status(500).json({ message: 'Erro ao buscar feed' });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await PostService.getUserPosts(userId);
    const albums = await PostService.getUserAlbums(userId);
    const hashtags = await PostService.getAllHashtags();
    res.json({ userId, posts, albums, hashtags });
  } catch (error) {
    console.error('Erro ao carregar posts do usuário:', error);
    res.status(500).json({ message: 'Erro ao carregar posts do usuário' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await PostService.getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post não encontrado' });
    if (post.usuario_id !== req.user.id) return res.status(403).json({ message: 'Acesso negado' });

    if (post.arquivo_foto) {
      const imagePath = path.join(__dirname, '..', post.arquivo_foto);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await PostService.deletePost(req.params.id);
    res.json({ message: 'Post deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao apagar post:', error);
    res.status(500).json({ message: 'Erro ao apagar post' });
  }
};

exports.getPostById = (req, res) => {
  const postId = req.params.id;

  PostService.getPostById(postId, (error, post) => {
    if (error) {
      console.error('Erro ao buscar postagem:', error);
      return res.status(500).json({ error: 'Erro ao buscar postagem' });
    }

    res.json(post);
  });
};

exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Busca o post para garantir que o usuário é o dono
    const post = await PostService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }
    if (post.usuario_id !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const data = {
      legenda: req.body.legenda,
      localizacao: req.body.localizacao || null,
      hashtags: req.body.hashtags || null
    };

    if (req.file) {
      data.arquivo_foto = `/uploads/posts/${req.file.filename}`;
    }

    await PostService.updatePost(postId, data);
    res.status(200).json({ message: 'Post atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar postagem:', error);
    res.status(500).json({ message: 'Erro ao atualizar postagem' });
  }
};

exports.createAlbum = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const albumData = {
      usuario_id: req.user.id,
      nome: req.body.nome,
      descricao: req.body.descricao || null,
      fotos: req.files ? req.files.map(file => ({
        arquivo_foto: `/uploads/posts/${file.filename}`
      })) : []
    };

    await PostService.createAlbum(albumData);
    res.status(201).json({ message: 'Álbum criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar álbum:', error);
    res.status(500).json({ message: 'Erro ao criar álbum' });
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const albumId = req.params.id;
    const albumData = {
      nome: req.body.nome,
      descricao: req.body.descricao || null
    };

    // Verifica se o usuário é dono do álbum
    const album = await PostService.getAlbumByIdPromise(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Álbum não encontrado' });
    }
    if (album.usuario_id !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    await PostService.updateAlbum(albumId, albumData);

    if (req.files && req.files.length > 0) {
      const novasFotos = req.files.map(file => ({
        album_id: albumId,
        arquivo_foto: `/uploads/posts/${file.filename}`
      }));
      await PostService.addPhotosToAlbum(novasFotos);
    }

    res.status(200).json({ message: 'Álbum atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar álbum:', error);
    res.status(500).json({ message: 'Erro ao atualizar álbum' });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const albumId = req.params.id;
    const album = await PostService.getAlbumByIdPromise(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Álbum não encontrado' });
    }
    if (album.usuario_id !== req.user.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    await PostService.deleteAlbum(albumId);
    res.status(200).json({ message: 'Álbum excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir álbum:', error);
    res.status(500).json({ message: 'Erro ao excluir álbum' });
  }
};

exports.getAlbumById = async (req, res) => {
  try {
    const albumId = req.params.id;
    const album = await PostService.getAlbumByIdPromise(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Álbum não encontrado' });
    }
    res.json(album);
  } catch (error) {
    console.error('Erro ao buscar álbum:', error);
    res.status(500).json({ error: 'Erro ao buscar álbum' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const notificationData = {
      usuario_id: req.body.usuario_id,
      tipo: req.body.tipo,
      mensagem: req.body.mensagem
    };

    const notificationId = await PostService.createNotification(notificationData);
    res.status(201).json({ success: true, notificationId });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ success: false, error: 'Erro ao criar notificação' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      console.error('Usuário não autenticado ou ID do usuário não fornecido');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const notifications = await PostService.getUnreadNotificationsByUserId(userId);
    res.json(notifications || []);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    await PostService.markNotificationAsRead(notificationId);
    res.status(200).json({ success: true, message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ success: false, error: 'Erro ao marcar notificação como lida' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const alreadyLiked = await PostService.isPostLikedByUser(postId, userId);
    if (alreadyLiked) {
      return res.status(400).json({ success: false, message: 'Você já curtiu esta postagem' });
    }

    await PostService.likePost(userId, postId);

    const likesCount = await PostService.getLikesCount(postId);

    res.status(200).json({ success: true, likes: likesCount, isLiked: true });
  } catch (error) {
    console.error('Erro ao curtir postagem:', error);
    res.status(500).json({ success: false, error: 'Erro ao curtir postagem' });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const alreadyLiked = await PostService.isPostLikedByUser(postId, userId);
    if (!alreadyLiked) {
      return res.status(400).json({ success: false, message: 'Você ainda não curtiu esta postagem' });
    }

    await PostService.unlikePost(userId, postId);

    const likesCount = await PostService.getLikesCount(postId);

    res.status(200).json({ success: true, likes: likesCount, isLiked: false });
  } catch (error) {
    console.error('Erro ao descurtir postagem:', error);
    res.status(500).json({ success: false, error: 'Erro ao descurtir postagem' });
  }
};

exports.addComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    const commentData = {
      publicacao_id: req.params.id,
      usuario_id: req.user.id,
      texto: req.body.texto
    };

    await PostService.addComment(commentData);
    res.status(201).json({ success: true, message: 'Comentário adicionado com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ success: false, error: 'Erro ao adicionar comentário' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await PostService.getComments(postId);
    res.json(comments);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
};

exports.editComment = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const commentId = req.params.id;
    const { texto } = req.body;

    const comment = await PostService.getCommentById(commentId);
    if (!comment || comment.usuario_id !== req.session.user.id) {
      return res.redirect('/posts/feed');
    }

    await PostService.editComment(commentId, texto);
    res.redirect('/posts/feed');
  } catch (error) {
    console.error('Erro ao editar comentário:', error);
    res.redirect('/posts/feed');
  }
};

exports.deleteComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    const commentId = req.params.id;
    const comment = await PostService.getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentário não encontrado' });
    }

    if (comment.usuario_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    await PostService.deleteComment(commentId);
    res.status(200).json({ success: true, message: 'Comentário apagado com sucesso' });
  } catch (error) {
    console.error('Erro ao apagar comentário:', error);
    res.status(500).json({ success: false, error: 'Erro ao apagar comentário' });
  }
};
