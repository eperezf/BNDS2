const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Op, Sequelize, Model, DataTypes } = require("sequelize");
require('dotenv').config();
const PasswordHash = require('node-phpass').PasswordHash;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;


const sequelize = new Sequelize(process.env.LOGIN_DB_NAME, process.env.LOGIN_DB_USER, process.env.LOGIN_DB_PASS, {
  host: process.env.LOGIN_DB_ENDPOINT,
  logging: false,
  dialect: 'mysql'
});
const User = sequelize.define(
  'User',
  {
    user_login: {
      type: DataTypes.STRING
    },
    user_email: {
      type: DataTypes.STRING
    },
    user_pass: {
      type: DataTypes.STRING
    },
    display_name:{
      type: DataTypes.STRING
    }
  },
  {
    tableName: 'b_users',
    timestamps: false
  }
);

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  async (email, password, cb) => {
    logger = await User.findOne({raw: true,
      where: {
        [Op.or]: [
          {user_login: email},
          {user_email: email}
        ]
      }
    });
    if (!logger) {
      return cb(null, false, {message: 'Error al iniciar sesión.'});
    }
    const len = 8;
    const portable = true;
    const phpversion = 7;
    const hasher = new PasswordHash(len, portable, phpversion);
    const valid = hasher.CheckPassword(password,logger.user_pass)
    if (valid == true) {
      return cb(null, {id:logger.id, name:logger.display_name}, {message: 'Sesión iniciada correctamente.'});
    }
    else {
      return cb(null, false, {message: 'Error al iniciar sesión.'});
    }
  }
));

var cookieExtractor = (req) => {
  var token = null;
  if (req && req.cookies){
    token = req.cookies['token'];
  }
  return token;
};

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey   : process.env.JWT_SECRET,
        ignoreExpiration: false
    },
    (jwtPayload, cb) => {
      return cb(null, jwtPayload, {message: 'Logged In Successfully'});
    }
));
