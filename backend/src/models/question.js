export default function Question(sequelize, DataTypes) {
  const Question = sequelize.define('question', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false }
  });
  return Question;
}
