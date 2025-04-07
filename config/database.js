const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'social_network'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados!');
});

module.exports = connection;
