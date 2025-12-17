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


export default db;
