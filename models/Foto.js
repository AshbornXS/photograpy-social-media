const db = require('../config/database');

class Foto {
  static create(foto, callback) {
    const sql = 'INSERT INTO Fotos (publicacao_id, arquivo_foto, descricao) VALUES (?, ?, ?)';
    db.query(sql, [foto.publicacao_id, foto.arquivo_foto, foto.descricao], callback);
  }
}

module.exports = Foto;
