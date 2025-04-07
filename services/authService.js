const bcrypt = require('bcrypt');
const UserRepository = require('../repositories/userRepository');

class AuthService {
  static async register(userData) {
    const { nome, email, senha, data_nascimento, foto_perfil, biografia } = userData;

    try {

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser.length > 0) {
        return { success: false, message: 'Este email já foi cadastrado.' };
      }


      const hashedPassword = await bcrypt.hash(senha, 10);


      const user = { nome, email, senha: hashedPassword, data_nascimento, foto_perfil, biografia };
      await UserRepository.create(user);

      return { success: true, message: 'Usuário cadastrado com sucesso!' };
    } catch (error) {
      console.error('Erro no serviço de registro:', error);
      throw error;
    }
  }

  static async login(email, senha) {
    try {
      const user = await UserRepository.findByEmail(email);
      if (user.length === 0) {
        return { success: false, message: 'E-mail ou senha incorretos.' };
      }

      const isPasswordValid = await bcrypt.compare(senha, user[0].senha);
      if (!isPasswordValid) {
        return { success: false, message: 'E-mail ou senha incorretos.' };
      }

      return { success: true, user: user[0] };
    } catch (error) {
      console.error('Erro no serviço de login:', error);
      throw error;
    }
  }
}

module.exports = AuthService;
