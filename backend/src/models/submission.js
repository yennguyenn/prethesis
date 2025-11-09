export default (sequelize, DataTypes) => {
  const Submission = sequelize.define(
    'Submission',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      majorCode: { type: DataTypes.STRING },
      majorName: { type: DataTypes.STRING },
      subMajorCode: { type: DataTypes.STRING },
      subMajorName: { type: DataTypes.STRING },
      score: { type: DataTypes.FLOAT },
      // Store full breakdown and any other metadata
      details: { type: DataTypes.JSONB },
    },
    {
      tableName: 'Submissions',
      timestamps: true, // createdAt / updatedAt
    }
  );
  return Submission;
};
