export default (sequelize, DataTypes) => {
  const Major = sequelize.define('Major', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING, unique: true }, // e.g. CS, SE, AI
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT }
  });
  return Major;
};
