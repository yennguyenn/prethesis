const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    passwordHash: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'user' } // 'admin' or 'user'
  });

  User.prototype.setPassword = async function(password) {
    this.passwordHash = await bcrypt.hash(password, 10);
  };

  User.prototype.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
  };

  return User;
};
