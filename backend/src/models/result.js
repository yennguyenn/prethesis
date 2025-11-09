export default (sequelize, DataTypes) => {
  const Response = sequelize.define('Response', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // store selected option id, user, quiz snapshot, computed results (optional)
    selectedOptionId: { type: DataTypes.INTEGER },
    // snapshot point: we can store option scoring copy for auditing
    scoringSnapshot: { type: DataTypes.JSONB }
  });
  return Response;
};
