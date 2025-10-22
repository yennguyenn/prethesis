export default (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    // optional: tag, difficulty, etc.
  });
  return Question;
};
