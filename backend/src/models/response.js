import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Response = sequelize.define('Response', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    questionId: { type: DataTypes.INTEGER, allowNull: true },
    optionId: { type: DataTypes.INTEGER, allowNull: true },
    answer: { type: DataTypes.JSONB, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'Responses',
    timestamps: false
  });

  return Response;
};
