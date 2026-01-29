import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  // Expose camelCase attributes but map to existing snake_case columns
  const QuestionCriteriaMap = sequelize.define('QuestionCriteriaMap', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    questionId: { type: DataTypes.INTEGER, allowNull: true, field: 'question_id' },
    criteriaCode: { type: DataTypes.STRING, allowNull: true, field: 'criteria_code' },
    weight: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 1 }
  }, {
    tableName: 'question_criteria_map',
    timestamps: false,
    underscored: true
  });

  return QuestionCriteriaMap;
};
