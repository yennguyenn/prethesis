export default (sequelize, DataTypes) => {
  const Major = sequelize.define('Major', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING, unique: true }, 
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    riasec_scores: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} }
  });
  return Major;
};
