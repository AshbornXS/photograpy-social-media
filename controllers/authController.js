const AuthService = require('../services/authService');
const path = require('path');
const fs = require('fs');
const UserRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secretonava';

exports.register = async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    if (result.success) {
      return res.status(201).json({ message: result.message });
    }
    res.status(400).json({ message: result.message });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro no cadastro. Tente novamente.' });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.senha);
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    const user = result.user;
    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao realizar login. Tente novamente.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const userId = req.session.user.id;
    const updatedUser = {
      nome: req.body.nome,
      email: req.body.email,
      data_nascimento: req.body.data_nascimento || null,
      biografia: req.body.biografia || null,
      foto_perfil: req.file ? `/uploads/pictures/${req.file.filename}` : req.session.user.foto_perfil
    };

    if (req.file && req.session.user.foto_perfil) {
      const oldPath = path.join(__dirname, '..', req.session.user.foto_perfil);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }


    await UserRepository.update(userId, updatedUser);


    req.session.user = { ...req.session.user, ...updatedUser };


    res.redirect(`/user/${req.session.user.id}`);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};

exports.followUser = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const followerId = req.session.user.id;
    const userId = req.params.id;

    await UserRepository.followUser(followerId, userId);
    res.redirect(`/user/${req.session.user.id}`);
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const followerId = req.session.user.id;
    const userId = req.params.id;

    await UserRepository.unfollowUser(followerId, userId);
    res.redirect(`/user/${req.session.user.id}`);
  } catch (error) {
    console.error('Erro ao deixar de seguir usuário:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};

exports.changePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const userId = req.user.id;
    const { senha_atual, nova_senha } = req.body;

    const user = await UserRepository.getUserProfile(userId);
    if (!user || !user.senha) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const isPasswordValid = await bcrypt.compare(senha_atual, user.senha);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Senha atual incorreta.' });
    }

    const hashedPassword = await bcrypt.hash(nova_senha, 10);

    await UserRepository.updatePassword(userId, hashedPassword);

    res.status(200).json({
      message: 'Senha alterada com sucesso. Faça login novamente.',
      tokenInvalidated: true
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha.' });
  }
};
