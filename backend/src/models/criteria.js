import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Criteria = sequelize.define('Criteria', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'criteria',
    timestamps: false
  });

  return Criteria;
};
