import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const KeywordRule = sequelize.define('KeywordRule', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    level:       { type: DataTypes.INTEGER, allowNull: false },
    question_id: { type: DataTypes.INTEGER, allowNull: false, field: 'question_id' },
    keywords:    { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false },
    scores:      { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  }, {
    tableName:  'keyword_rules',
    timestamps: false,
    underscored: true,
  });

  return KeywordRule;
};
