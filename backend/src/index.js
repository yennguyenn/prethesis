// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// dotenv.config();

// import authRoutes from "./routes/auth.js";
// import majorsRoutes from "./routes/majors.js";
// import questionsRoutes from "./routes/questions.js";
// import resultsRoutes from "./routes/results.js";

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/majors", majorsRoutes);
// app.use("/api/questions", questionsRoutes);
// app.use("/api/results", resultsRoutes);

// const port = process.env.PORT || 5000;
// app.listen(port, () => console.log(`Server running on port ${port}`));

const { Sequelize } = require('sequelize');
require('dotenv').config();
const config = require('../config/config').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: false
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Major = require('./major')(sequelize, Sequelize);
db.Level = require('./level')(sequelize, Sequelize);
db.Question = require('./question')(sequelize, Sequelize);
db.Option = require('./option')(sequelize, Sequelize);
db.Response = require('./response')(sequelize, Sequelize);

// associations
db.Level.hasMany(db.Question, { foreignKey: 'levelId' });
db.Question.belongsTo(db.Level, { foreignKey: 'levelId' });

db.Question.hasMany(db.Option, { foreignKey: 'questionId', onDelete: 'CASCADE' });
db.Option.belongsTo(db.Question, { foreignKey: 'questionId' });

db.Major.hasMany(db.Option, { foreignKey: 'majorId' }); // optional: if options link to majors
// Responses
db.User.hasMany(db.Response, { foreignKey: 'userId' });
db.Response.belongsTo(db.User, { foreignKey: 'userId' });

db.Question.hasMany(db.Response, { foreignKey: 'questionId' });
db.Response.belongsTo(db.Question, { foreignKey: 'questionId' });

module.exports = db;
