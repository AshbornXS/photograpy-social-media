const AuthService = require('../services/authService');
const path = require('path');
const fs = require('fs');
const UserRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const result = await AuthService.register(req.body);

    if (result.success) {
      const loginResult = await AuthService.login(req.body.email, req.body.senha);
      if (loginResult.success) {
        req.session.user = loginResult.user;
        return res.redirect('/');
      }
    }

    res.render('register', {
      message: result.message,
      nome: req.body.nome || '',
      email: req.body.email || ''
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.render('register', {
      message: 'Erro no cadastro. Tente novamente.',
      nome: req.body.nome || '',
      email: req.body.email || ''
    });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.senha);

    if (!result.success) {
      return res.render('login', { message: result.message });
    }

    req.session.user = result.user;
    res.redirect('/');
  } catch (error) {
    console.error('Erro no login:', error);
    res.render('login', { message: 'Erro ao realizar login. Tente novamente.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Erro ao encerrar a sessão:', err);
    res.redirect('/');
  });
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

exports.loginPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.render('login', { message: '' });
};

exports.registerPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.render('register', { message: '', nome: '', email: '' });
};

exports.changePassword = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');

    const userId = req.session.user.id;
    const { senha_atual, nova_senha } = req.body;


    const user = await UserRepository.getUserProfile(userId);
    if (!user || !user.senha) {
      return res.render('profile', {
        user: req.session.user,
        message: 'Erro ao buscar dados do usuário.',
        posts: [],
        albums: [],
        hashtags: []
      });
    }

    const isPasswordValid = await bcrypt.compare(senha_atual, user.senha);

    if (!isPasswordValid) {
      return res.render('profile', {
        user: req.session.user,
        message: 'Senha atual incorreta.',
        posts: [],
        albums: [],
        hashtags: []
      });
    }


    const hashedPassword = await bcrypt.hash(nova_senha, 10);


    await UserRepository.updatePassword(userId, hashedPassword);


    req.session.destroy((err) => {
      if (err) console.error('Erro ao encerrar a sessão:', err);
      res.redirect('/auth/login');
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.redirect(`/user/${req.session.user.id}`);
  }
};
