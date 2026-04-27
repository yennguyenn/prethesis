export default function Question(sequelize, DataTypes) {
  const Question = sequelize.define('question', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    level_id: { type: DataTypes.INTEGER, allowNull: true, field: 'level_id' },
    major_code: { type: DataTypes.STRING, allowNull: true, field: 'major_code' },
    question_type: { type: DataTypes.ENUM('multiple_choice', 'text_autocomplete'), defaultValue: 'multiple_choice', allowNull: false }
  });
  return Question;
}
6