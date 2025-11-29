export default (sequelize, DataTypes) => {
  const SubMajor = sequelize.define('SubMajor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    studyGroup: { type: DataTypes.STRING },
  });
  return SubMajor;
};
