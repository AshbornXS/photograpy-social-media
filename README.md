Integrantes:
- Beatriz Vitória Lourenço Vitoriano
- Bianca Sousa Sales Paiva
- Liz Almeida de Oliveira
- Pedro Henrique Alves de Azevedo
- Raissa Lana Martins da Costa
- Wyllerson de Aquino Cavenaghi

Banco de Dados:
```
CREATE DATABASE social_network;
USE social_network;

CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    foto_perfil VARCHAR(255),
    biografia TEXT
);

CREATE TABLE Publicacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    legenda TEXT,
    localizacao VARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

CREATE TABLE Fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacao_id INT,
    arquivo_foto VARCHAR(255) NOT NULL,
    descricao TEXT,
    FOREIGN KEY (publicacao_id) REFERENCES Publicacoes(id) ON DELETE CASCADE
);

CREATE TABLE Comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacao_id INT,
    usuario_id INT,
    texto TEXT NOT NULL,
    data_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicacao_id) REFERENCES Publicacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

CREATE TABLE Curtidas (
    publicacao_id INT,
    usuario_id INT,
    data_curtida DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (publicacao_id, usuario_id),
    FOREIGN KEY (publicacao_id) REFERENCES Publicacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

CREATE TABLE Seguidores (
    usuario_id INT,
    seguidor_id INT,
    data_seguimento DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, seguidor_id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (seguidor_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

CREATE TABLE Hashtags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE Publicacoes_Hashtags (
    publicacao_id INT,
    hashtag_id INT,
    PRIMARY KEY (publicacao_id, hashtag_id),
    FOREIGN KEY (publicacao_id) REFERENCES Publicacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (hashtag_id) REFERENCES Hashtags(id) ON DELETE CASCADE
);

CREATE TABLE Albuns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

CREATE TABLE Fotos_Albuns (
    album_id INT,
    foto_id INT,
    PRIMARY KEY (album_id, foto_id),
    FOREIGN KEY (album_id) REFERENCES Albuns(id) ON DELETE CASCADE,
    FOREIGN KEY (foto_id) REFERENCES Fotos(id) ON DELETE CASCADE
);

CREATE TABLE Notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tipo VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    data_notificacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);
```
