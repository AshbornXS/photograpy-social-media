const PostService = require('../services/postService');
const path = require('path');
const fs = require('fs');

exports.createPost = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const postData = {
      usuario_id: req.session.user.id,
      legenda: req.body.legenda,
      localizacao: req.body.localizacao || null,
      hashtags: req.body.hashtags || null
    };


    if (req.file) {
      const imageUrl = `/uploads/posts/${req.file.filename}`;
      postData.arquivo_foto = imageUrl;
    }

    await PostService.createPost(postData);
    res.redirect(`/user/${req.session.user.id}`);
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};

exports.getFeed = async (req, res) => {
  try {
    const userId = req.session.user ? req.session.user.id : null;


    const posts = await PostService.getFeed(userId);


    for (const post of posts) {
      post.likes = await PostService.getLikesCount(post.id);
      post.comentarios = post.comentarios || [];
    }

    res.render('index', { user: req.session.user || null, posts });
  } catch (error) {
    console.error('Erro ao carregar feed:', error);
    res.render('index', { user: req.session.user || null, posts: [] });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const userId = req.session.user.id;


    const posts = await PostService.getUserPosts(userId);


    const albums = await PostService.getUserAlbums(userId);


    const hashtags = await PostService.getAllHashtags();

    res.render('profile', { user: req.session.user, posts, albums, hashtags });
  } catch (error) {
    console.error('Erro ao carregar posts do usuário:', error);
    res.render('profile', { user: req.session.user, posts: [], albums: [], hashtags: [] });
  }
};

exports.deletePost = (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');

  PostService.getPostById(req.params.id, (error, post) => {
    if (error || !post) {
      console.error('Erro ao buscar postagem para exclusão:', error);
      return res.redirect(`/user/${req.session.user.id}`);
    }


    if (post.arquivo_foto) {
      const imagePath = path.join(__dirname, '..', post.arquivo_foto);
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Erro ao excluir imagem da postagem:', err);
        });
      }
    }


    PostService.deletePost(req.params.id, (error) => {
      if (error) {
        console.error('Erro ao apagar post:', error);
        return res.redirect(`/user/${req.session.user.id}`);
      }
      res.redirect(`/user/${req.session.user.id}`);
    });
  });
};

exports.getPostsByHashtag = (req, res) => {
  const hashtags = req.query.hashtags ? req.query.hashtags.split(',') : [];

  PostService.getAllHashtags((error, allHashtags) => {
    if (error) {
      console.error('Erro ao carregar hashtags:', error);
      return res.render('index', { user: req.session.user || null, posts: [], hashtags: allHashtags, filtroHashtags: [] });
    }


    if (hashtags.length === 0) {
      return PostService.getAllPosts((error, posts) => {
        if (error) {
          console.error('Erro ao carregar feed:', error);
          return res.render('index', { user: req.session.user || null, posts: [], hashtags: allHashtags, filtroHashtags: [] });
        }

        res.render('index', { user: req.session.user || null, posts, hashtags: allHashtags, filtroHashtags: [] });
      });
    }


    PostService.getPostsByHashtag(hashtags, (error, posts) => {
      if (error) {
        console.error('Erro ao carregar posts por hashtags:', error);
        return res.render('index', { user: req.session.user || null, posts: [], hashtags: allHashtags, filtroHashtags: hashtags });
      }

      res.render('index', { user: req.session.user || null, posts, hashtags: allHashtags, filtroHashtags: hashtags });
    });
  });
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
    if (!req.session.user) return res.redirect('/auth/login');

    const postId = req.params.id;
    const data = {
      legenda: req.body.legenda,
      localizacao: req.body.localizacao || null,
      hashtags: req.body.hashtags || null
    };


    if (req.file) {
      data.arquivo_foto = `/uploads/posts/${req.file.filename}`;
    }

    await PostService.updatePost(postId, data);
    res.redirect(`/user/${req.session.user.id}`);
  } catch (error) {
    console.error('Erro ao atualizar postagem:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};

exports.createAlbum = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const albumData = {
      usuario_id: req.session.user.id,
      nome: req.body.nome,
      descricao: req.body.descricao || null,
      fotos: req.files.map(file => ({
        arquivo_foto: `/uploads/posts/${file.filename}`
      }))
    };

    await PostService.createAlbum(albumData);
    res.redirect(`/user/${req.session.user.id}`);
  } catch (error) {
    console.error('Erro ao criar álbum:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const albumId = req.params.id;
    const albumData = {
      nome: req.body.nome,
      descricao: req.body.descricao || null
    };


    await PostService.updateAlbum(albumId, albumData);


    if (req.files && req.files.length > 0) {
      const novasFotos = req.files.map(file => ({
        album_id: albumId,
        arquivo_foto: `/uploads/posts/${file.filename}`
      }));
      await PostService.addPhotosToAlbum(novasFotos);
    }

    res.redirect(`/user/${req.session.user.id}`);
  } catch (error) {
    console.error('Erro ao atualizar álbum:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const albumId = req.params.id;
    await PostService.deleteAlbum(albumId);
    res.redirect(`/user/${req.session.user.id}`);
  } catch (error) {
    console.error('Erro ao excluir álbum:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};

exports.getAlbumById = (req, res) => {
  const albumId = req.params.id;

  PostService.getAlbumById(albumId, (error, album) => {
    if (error) {
      console.error('Erro ao buscar álbum:', error);
      return res.status(500).json({ error: 'Erro ao buscar álbum' });
    }

    if (!album) {
      console.error('Álbum não encontrado:', albumId);
      return res.status(404).json({ error: 'Álbum não encontrado' });
    }

    res.json(album);
  });
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
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    const userId = req.session.user.id;
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
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    const userId = req.session.user.id;
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
    if (!req.session.user) return res.redirect('/auth/login');

    const commentData = {
      publicacao_id: req.params.id,
      usuario_id: req.session.user.id,
      texto: req.body.texto
    };

    await PostService.addComment(commentData);
    res.redirect(`/posts/feed`);
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.redirect(`/posts/feed`);
  }
};

exports.getComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user ? req.session.user.id : null;
    const comments = await PostService.getCommentsWithOwnership(postId, userId);
    console.log(comments);
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
    if (!req.session.user) return res.redirect('/auth/login');

    const commentId = req.params.id;


    const comment = await PostService.getCommentById(commentId);
    if (!comment || comment.usuario_id !== req.session.user.id) {
      return res.redirect('/posts/feed');
    }


    await PostService.deleteComment(commentId);
    res.redirect('/posts/feed');
  } catch (error) {
    console.error('Erro ao apagar comentário:', error);
    res.redirect('/posts/feed');
  }
};
