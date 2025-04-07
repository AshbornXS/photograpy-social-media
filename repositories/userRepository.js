const db = require('../config/database');

class UserRepository {
  static create(user) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Usuarios (nome, email, senha, data_nascimento, foto_perfil, biografia) VALUES (?, ?, ?, ?, ?, ?)';
      const values = [user.nome, user.email, user.senha, user.data_nascimento, user.foto_perfil, user.biografia];
      db.query(sql, values, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Usuarios WHERE email = ?';
      db.query(sql, [email], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static update(userId, userData) {
    const sql = `
      UPDATE Usuarios
      SET nome = ?, email = ?, data_nascimento = ?, biografia = ?, foto_perfil = ?
      WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, [
        userData.nome,
        userData.email,
        userData.data_nascimento,
        userData.biografia,
        userData.foto_perfil,
        userId
      ], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static updatePassword(userId, hashedPassword) {
    const sql = 'UPDATE Usuarios SET senha = ? WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [hashedPassword, userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static followUser(followerId, userId) {
    const sql = 'INSERT INTO Seguidores (usuario_id, seguidor_id) VALUES (?, ?)';
    return new Promise((resolve, reject) => {
      db.query(sql, [userId, followerId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static unfollowUser(followerId, userId) {
    const sql = 'DELETE FROM Seguidores WHERE usuario_id = ? AND seguidor_id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [userId, followerId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static getUserProfile(userId) {
    const sql = 'SELECT id, nome, email, senha, data_nascimento, foto_perfil, biografia FROM Usuarios WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }

  static getUserPosts(userId) {
    const sql = `
      SELECT Publicacoes.*, Fotos.arquivo_foto
      FROM Publicacoes
      LEFT JOIN Fotos ON Fotos.publicacao_id = Publicacoes.id
      WHERE Publicacoes.usuario_id = ?
      ORDER BY Publicacoes.data_publicacao DESC
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static getFollowersCount(userId) {
    const sql = 'SELECT COUNT(*) AS seguidores FROM Seguidores WHERE usuario_id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].seguidores);
      });
    });
  }

  static getFollowingCount(userId) {
    const sql = 'SELECT COUNT(*) AS seguindo FROM Seguidores WHERE seguidor_id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].seguindo);
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

  static getFollowers(userId) {
    const sql = 'SELECT seguidor_id FROM Seguidores WHERE usuario_id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = UserRepository;
