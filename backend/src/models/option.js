module.exports = (sequelize, DataTypes) => {
  const Option = sequelize.define('Option', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    // scoring: JSON mapping majorId -> points
    scoring: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }
  });
  return Option;
};
