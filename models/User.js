const db = require('../config/database');

class User {
  constructor(id, nome, email, senha, data_nascimento, foto_perfil, biografia) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.data_nascimento = data_nascimento;
    this.foto_perfil = foto_perfil;
    this.biografia = biografia;
  }

  static create(user, callback) {
    const sql = 'INSERT INTO Usuarios (nome, email, senha, data_nascimento, foto_perfil, biografia) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [user.nome, user.email, user.senha, user.data_nascimento, user.foto_perfil, user.biografia], callback);
  }

  static findByEmail(email, callback) {
    db.query('SELECT * FROM Usuarios WHERE email = ?', [email], callback);
  }
}

module.exports = User;
