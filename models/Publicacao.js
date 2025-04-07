const db = require('../config/database');

class Publicacao {
  static create(publicacao, callback) {
    const sql = 'INSERT INTO Publicacoes (usuario_id, legenda, localizacao) VALUES (?, ?, ?)';
    db.query(sql, [publicacao.usuario_id, publicacao.legenda, publicacao.localizacao], (err, result) => {
      if (err) return callback(err);
      callback(null, result.insertId);
    });
  }

  static findAll(callback) {
    const sql = `
      SELECT Publicacoes.*, Usuarios.nome AS user_name, Fotos.arquivo_foto
      FROM Publicacoes
      JOIN Usuarios ON Publicacoes.usuario_id = Usuarios.id
      LEFT JOIN Fotos ON Fotos.publicacao_id = Publicacoes.id
      ORDER BY Publicacoes.data_publicacao DESC
    `;
    db.query(sql, callback);
  }

  static findByUserId(userId, callback) {
    const sql = `
      SELECT Publicacoes.*, Fotos.arquivo_foto
      FROM Publicacoes
      LEFT JOIN Fotos ON Fotos.publicacao_id = Publicacoes.id
      WHERE Publicacoes.usuario_id = ?
      ORDER BY Publicacoes.data_publicacao DESC
    `;
    db.query(sql, [userId], callback);
  }

  static deleteById(publicacaoId, callback) {
    const sql = 'DELETE FROM Publicacoes WHERE id = ?';
    db.query(sql, [publicacaoId], callback);
  }

  static updateById(publicacaoId, data, callback) {
    const sql = 'UPDATE Publicacoes SET legenda = ?, localizacao = ? WHERE id = ?';
    db.query(sql, [data.legenda, data.localizacao, publicacaoId], callback);
  }
}

module.exports = Publicacao;
