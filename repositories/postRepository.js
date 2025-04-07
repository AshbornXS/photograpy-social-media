const db = require('../config/database');

class PostRepository {
  static create(postData) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Publicacoes (usuario_id, legenda, localizacao) VALUES (?, ?, ?)';
      db.query(sql, [postData.usuario_id, postData.legenda, postData.localizacao], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  }

  static addFoto(fotoData) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Fotos (publicacao_id, arquivo_foto, descricao) VALUES (?, ?, ?)';
      db.query(sql, [fotoData.publicacao_id, fotoData.arquivo_foto, fotoData.descricao], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  }

  static findAll() {
    const sql = `
      SELECT Publicacoes.*, Usuarios.nome AS user_name, Usuarios.foto_perfil, Fotos.arquivo_foto
      FROM Publicacoes
      JOIN Usuarios ON Publicacoes.usuario_id = Usuarios.id
      LEFT JOIN Fotos ON Fotos.publicacao_id = Publicacoes.id
      ORDER BY Publicacoes.data_publicacao DESC
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static findByUserId(userId) {
    const sql = `
      SELECT Publicacoes.*, Fotos.arquivo_foto
      FROM Publicacoes
      LEFT JOIN Fotos ON Fotos.publicacao_id = Publicacoes.id
      WHERE Publicacoes.usuario_id = ?
      ORDER BY Publicacoes.data_publicacao DESC
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, [userId], (err, results) => {
        if (err) {
          console.error('Erro ao buscar publicações do usuário:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static findByHashtag(hashtags, callback) {
    const placeholders = hashtags.map(() => '?').join(',');
    const sql = `
      SELECT Publicacoes.*,
      Usuarios.nome AS user_name,
      Usuarios.foto_perfil,
      MAX(Fotos.arquivo_foto) AS arquivo_foto,
      GROUP_CONCAT(Hashtags.nome) AS hashtags
      FROM Publicacoes
      JOIN Usuarios ON Publicacoes.usuario_id = Usuarios.id
      LEFT JOIN Fotos ON Fotos.publicacao_id = Publicacoes.id
      LEFT JOIN Publicacoes_Hashtags ON Publicacoes.id = Publicacoes_Hashtags.publicacao_id
      LEFT JOIN Hashtags ON Publicacoes_Hashtags.hashtag_id = Hashtags.id
      WHERE Hashtags.nome IN (${placeholders})
      GROUP BY Publicacoes.id, Usuarios.nome, Usuarios.foto_perfil
      ORDER BY Publicacoes.data_publicacao DESC
    `;
    db.query(sql, hashtags, callback);
  }

  static deleteById(postId, callback) {
    const sql = 'DELETE FROM Publicacoes WHERE id = ?';
    db.query(sql, [postId], callback);
  }

  static updateById(postId, data) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE Publicacoes
        SET legenda = ?, localizacao = ?
        WHERE id = ?
      `;
      db.query(sql, [data.legenda, data.localizacao, postId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static addHashtags(postId, hashtags) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Publicacoes_Hashtags (publicacao_id, hashtag_id) VALUES ?';
      const values = hashtags.map(tag => [postId, tag]);
      db.query(sql, [values], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static findAllHashtags(callback) {
    const sql = `
      SELECT DISTINCT nome
      FROM Hashtags
      ORDER BY nome ASC
    `;
    db.query(sql, callback);
  }

  static findHashtagsByName(hashtags) {
    return new Promise((resolve, reject) => {
      const placeholders = hashtags.map(() => '?').join(',');
      const sql = `SELECT id, nome FROM Hashtags WHERE nome IN (${placeholders})`;
      db.query(sql, hashtags, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static createHashtags(hashtags) {
    return new Promise((resolve, reject) => {
      const values = hashtags.map(tag => [tag]);
      const sql = 'INSERT INTO Hashtags (nome) VALUES ?';
      db.query(sql, [values], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static findById(postId, callback) {
    const sql = `
      SELECT Publicacoes.*,
             MAX(Fotos.arquivo_foto) AS arquivo_foto,
             GROUP_CONCAT(Hashtags.nome) AS hashtags
      FROM Publicacoes
      LEFT JOIN Fotos ON Fotos.publicacao_id = Publicacoes.id
      LEFT JOIN Publicacoes_Hashtags ON Publicacoes.id = Publicacoes_Hashtags.publicacao_id
      LEFT JOIN Hashtags ON Publicacoes_HashtagS.hashtag_id = Hashtags.id
      WHERE Publicacoes.id = ?
      GROUP BY Publicacoes.id
    `;
    db.query(sql, [postId], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  }

  static updatePostHashtags(postId, hashtagIds) {
    return new Promise((resolve, reject) => {
      const deleteSql = 'DELETE FROM Publicacoes_Hashtags WHERE publicacao_id = ?';
      const insertSql = 'INSERT INTO Publicacoes_Hashtags (publicacao_id, hashtag_id) VALUES ?';


      db.query(deleteSql, [postId], (err) => {
        if (err) return reject(err);


        if (hashtagIds.length > 0) {
          const values = hashtagIds.map(hashtagId => [postId, hashtagId]);
          db.query(insertSql, [values], (err) => {
            if (err) return reject(err);
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  static updatePhoto(postId, arquivoFoto, descricao) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE Fotos
        SET arquivo_foto = ?, descricao = ?
        WHERE publicacao_id = ?
      `;
      db.query(sql, [arquivoFoto, descricao, postId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static createAlbum(albumData) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Albuns (usuario_id, nome, descricao) VALUES (?, ?, ?)';
      db.query(sql, [albumData.usuario_id, albumData.nome, albumData.descricao], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  }

  static deletePhotosFromAlbum(albumId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Fotos_Albuns WHERE album_id = ?';
      db.query(sql, [albumId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static addPhotosToAlbum(fotos) {
    return new Promise((resolve, reject) => {
      const values = fotos.map(foto => [foto.album_id, foto.foto_id]);
      const sql = 'INSERT INTO Fotos_Albuns (album_id, foto_id) VALUES ?';
      db.query(sql, [values], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static findAllAlbums() {
    const sql = `
      SELECT Albuns.*, Usuarios.nome AS user_name, Usuarios.foto_perfil,
             COALESCE(GROUP_CONCAT(Fotos.arquivo_foto), '') AS fotos
      FROM Albuns
      JOIN Usuarios ON Albuns.usuario_id = Usuarios.id
      LEFT JOIN Fotos_Albuns ON Albuns.id = Fotos_Albuns.album_id
      LEFT JOIN Fotos ON Fotos.id = Fotos_Albuns.foto_id
      GROUP BY Albuns.id, Usuarios.nome, Usuarios.foto_perfil
      ORDER BY Albuns.data_criacao DESC
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static findAlbumsByUserId(userId) {
    const sql = `
      SELECT Albuns.*, COALESCE(GROUP_CONCAT(Fotos.arquivo_foto), '') AS fotos
      FROM Albuns
      LEFT JOIN Fotos_Albuns ON Albuns.id = Fotos_Albuns.album_id
      LEFT JOIN Fotos ON Fotos.id = Fotos_Albuns.foto_id
      WHERE Albuns.usuario_id = ?
      GROUP BY Albuns.id
      ORDER BY Albuns.data_criacao DESC
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, [userId], (err, results) => {
        if (err) {
          console.error('Erro ao buscar álbuns do usuário:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static updateAlbum(albumId, albumData) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE Albuns SET nome = ?, descricao = ? WHERE id = ?';
      db.query(sql, [albumData.nome, albumData.descricao, albumId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static deleteAlbum(albumId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Albuns WHERE id = ?';
      db.query(sql, [albumId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static findAlbumById(albumId, callback) {
    const sql = `
      SELECT Albuns.*, COALESCE(GROUP_CONCAT(Fotos.arquivo_foto), '') AS fotos
      FROM Albuns
      LEFT JOIN Fotos_Albuns ON Albuns.id = Fotos_Albuns.album_id
      LEFT JOIN Fotos ON Fotos.id = Fotos_Albuns.foto_id
      WHERE Albuns.id = ?
      GROUP BY Albuns.id
    `;
    db.query(sql, [albumId], (err, results) => {
      if (err) {
        console.error('Erro ao buscar álbum no banco de dados:', err);
        return callback(err);
      }
      if (results.length === 0) {
        console.error('Nenhum álbum encontrado com o ID:', albumId);
        return callback(null, null);
      }
      callback(null, results[0]);
    });
  }

  static createNotification(notificationData) {
    const sql = 'INSERT INTO Notificacoes (usuario_id, tipo, mensagem, lida) VALUES (?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
      db.query(sql, [notificationData.usuario_id, notificationData.tipo, notificationData.mensagem, false], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static findNotificationsByUserId(userId) {
    const sql = 'SELECT * FROM Notificacoes WHERE usuario_id = ? ORDER BY data_notificacao DESC';
    return new Promise((resolve, reject) => {
      db.query(sql, [userId], (err, results) => {
        if (err) {
          console.error('Erro ao buscar notificações no banco de dados:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static findUnreadNotificationsByUserId(userId) {
    const sql = 'SELECT * FROM Notificacoes WHERE usuario_id = ? AND lida = FALSE ORDER BY data_notificacao DESC';
    return new Promise((resolve, reject) => {
      db.query(sql, [userId], (err, results) => {
        if (err) {
          console.error('Erro ao buscar notificações não lidas no banco de dados:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static markNotificationAsRead(notificationId) {
    const sql = 'UPDATE Notificacoes SET lida = TRUE WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [notificationId], (err) => {
        if (err) {
          console.error('Erro ao marcar notificação como lida no banco de dados:', err);
          return reject(err);
        }
        resolve();
      });
    });
  }

  static likePost(userId, postId) {
    const sql = 'INSERT INTO Curtidas (publicacao_id, usuario_id) VALUES (?, ?)';
    return new Promise((resolve, reject) => {
      db.query(sql, [postId, userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static unlikePost(userId, postId) {
    const sql = 'DELETE FROM Curtidas WHERE publicacao_id = ? AND usuario_id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [postId, userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static isPostLikedByUser(postId, userId) {
    const sql = 'SELECT 1 FROM Curtidas WHERE publicacao_id = ? AND usuario_id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [postId, userId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      });
    });
  }

  static isUserFollowing(followerId, userId) {
    const sql = 'SELECT 1 FROM Seguidores WHERE seguidor_id = ? AND usuario_id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [followerId, userId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      });
    });
  }

  static addComment(commentData) {
    const sql = 'INSERT INTO Comentarios (publicacao_id, usuario_id, texto) VALUES (?, ?, ?)';
    return new Promise((resolve, reject) => {
      db.query(sql, [commentData.publicacao_id, commentData.usuario_id, commentData.texto], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static getComments(postId) {
    const sql = `
      SELECT Comentarios.*, Usuarios.nome AS user_name
      FROM Comentarios
      JOIN Usuarios ON Comentarios.usuario_id = Usuarios.id
      WHERE Comentarios.publicacao_id = ?
      ORDER BY Comentarios.data_comentario ASC
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, [postId], (err, results) => {
        if (err) return reject(err);
        resolve(results || []);
      });
    });
  }

  static getCommentById(commentId) {
    const sql = 'SELECT * FROM Comentarios WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [commentId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }

  static updateComment(commentId, texto) {
    const sql = 'UPDATE Comentarios SET texto = ? WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [texto, commentId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static deleteComment(commentId) {
    const sql = 'DELETE FROM Comentarios WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [commentId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static getLikesCount(postId) {
    const sql = 'SELECT COUNT(*) AS likes FROM Curtidas WHERE publicacao_id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [postId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].likes || 0);
      });
    });
  }

  static getFeed() {
    const sql = `
      SELECT
        p.id,
        p.usuario_id,
        p.legenda,
        p.localizacao,
        p.data_publicacao,
        u.nome AS user_name,
        u.foto_perfil,
        (SELECT GROUP_CONCAT(f.arquivo_foto)
         FROM Fotos f
         WHERE f.publicacao_id = p.id) AS fotos,
        p.arquivo_foto
      FROM Publicacoes p
      LEFT JOIN Usuarios u ON p.usuario_id = u.id
      ORDER BY p.data_publicacao DESC
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = PostRepository;
