import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import configFile from '../config/config.js';
import UserModel from './user.js';
import MajorModel from './major.js';
import LevelModel from './level.js';
import QuestionModel from './question.js';
import OptionModel from './option.js';
import ResponseModel from './response.js';

dotenv.config();
const config = configFile.development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: false
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = UserModel(sequelize, Sequelize);
db.Major = MajorModel(sequelize, Sequelize);
db.Level = LevelModel(sequelize, Sequelize);
db.Question = QuestionModel(sequelize, Sequelize);
db.Option = OptionModel(sequelize, Sequelize);
db.Response = ResponseModel(sequelize, Sequelize);

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

export default db;
