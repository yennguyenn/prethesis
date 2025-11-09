import bcrypt from 'bcrypt';
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      trim: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user', // 'admin' or 'user'
    },
  });

  // Hash password trước khi lưu nếu có thay đổi
  User.beforeCreate(async (user) => {
    if (user.passwordHash) {
      user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
    }
  });

  // Method instance để set password (nếu cần cập nhật)
  User.prototype.setPassword = async function (password) {
    this.passwordHash = await bcrypt.hash(password, 10);
  };

  // Method instance để kiểm tra password
  User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
  };

  return User;
};
