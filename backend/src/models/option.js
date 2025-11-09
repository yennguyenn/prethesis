export default (sequelize, DataTypes) => {
  const Option = sequelize.define('Option', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    // scoring: JSON mapping majorId -> points
    scoring: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }
  });
  return Option;
};
