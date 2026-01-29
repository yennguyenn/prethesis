import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import configFile from '../config/config.js';
import User from './user.js';
import Major from './major.js';
import Level from './level.js';
import Question from './question.js';
import Option from './option.js';
import Result from './result.js';
import SubMajor from './submajor.js';
import Submission from './submission.js';
import Criteria from './criteria.js';
import QuestionCriteriaMap from './questionCriteriaMap.js';
import Response from './response.js';

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

db.User = User(sequelize, DataTypes);
db.Major = Major(sequelize, DataTypes);
db.Level = Level(sequelize, DataTypes);
db.Question = Question(sequelize, DataTypes);
db.Option = Option(sequelize, DataTypes);
db.Result = Result(sequelize, DataTypes);
db.SubMajor = SubMajor(sequelize, DataTypes);
db.Submission = Submission(sequelize, DataTypes);
db.Criteria = Criteria(sequelize, DataTypes);
db.QuestionCriteriaMap = QuestionCriteriaMap(sequelize, DataTypes);
db.Response = Response(sequelize, DataTypes);

// relationships
db.Level.hasMany(db.Question, { foreignKey: 'levelId' });
db.Question.belongsTo(db.Level, { foreignKey: 'levelId' });

db.Question.hasMany(db.Option, { foreignKey: 'questionId', onDelete: 'CASCADE' });
db.Option.belongsTo(db.Question, { foreignKey: 'questionId' });

db.Major.hasMany(db.Option, { foreignKey: 'majorId' }); // optional: if options link to majors
db.Option.belongsTo(db.Major, { foreignKey: 'majorId' });
// SubMajors (detailed specializations)
db.Major.hasMany(db.SubMajor, { foreignKey: 'majorId' });
db.SubMajor.belongsTo(db.Major, { foreignKey: 'majorId' });
// Results
db.User.hasMany(db.Result, { foreignKey: 'userId' });
db.Result.belongsTo(db.User, { foreignKey: 'userId' });

db.Question.hasMany(db.Result, { foreignKey: 'questionId' });
db.Result.belongsTo(db.Question, { foreignKey: 'questionId' });

db.Option.hasMany(db.Result, { foreignKey: 'optionId' });
db.Result.belongsTo(db.Option, { foreignKey: 'optionId' });

// Submissions (persisted aggregated results)
db.User.hasMany(db.Submission, { foreignKey: 'userId' });
db.Submission.belongsTo(db.User, { foreignKey: 'userId' });

// Question <-> Criteria mapping via question_criteria_map (use explicit associations
// that match existing column names to avoid Sequelize trying to alter the table)
// Use attribute names that map to the existing fields in the DB
db.Question.hasMany(db.QuestionCriteriaMap, { foreignKey: 'questionId', sourceKey: 'id', constraints: false });
db.QuestionCriteriaMap.belongsTo(db.Question, { foreignKey: 'questionId', targetKey: 'id', constraints: false });

db.Criteria.hasMany(db.QuestionCriteriaMap, { foreignKey: 'criteriaCode', sourceKey: 'code', constraints: false });
db.QuestionCriteriaMap.belongsTo(db.Criteria, { foreignKey: 'criteriaCode', targetKey: 'code', constraints: false });

// Responses relations (optional links)
db.User.hasMany(db.Response, { foreignKey: 'userId' });
db.Response.belongsTo(db.User, { foreignKey: 'userId' });
db.Question.hasMany(db.Response, { foreignKey: 'questionId' });
db.Response.belongsTo(db.Question, { foreignKey: 'questionId' });
db.Option.hasMany(db.Response, { foreignKey: 'optionId' });
db.Response.belongsTo(db.Option, { foreignKey: 'optionId' });


export default db;
