export default (sequelize, DataTypes) => {
  const Level = sequelize.define('Level', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING } // Level 1, Level 2
  });
  return Level;
};
