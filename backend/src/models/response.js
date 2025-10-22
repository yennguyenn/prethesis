module.exports = (sequelize, DataTypes) => {
  const Response = sequelize.define('Response', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    // store selected option id, user, quiz snapshot, computed results (optional)
    selectedOptionId: { type: DataTypes.UUID },
    // snapshot point: we can store option scoring copy for auditing
    scoringSnapshot: { type: DataTypes.JSONB }
  });
  return Response;
};
