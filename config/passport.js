var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var config_app = require('./application');
var config_db = require('./databases');

var User = require('../models/users/users');

module.exports = passport => {
    let opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeader(),
        secretOrKey: config_app.secret
    };

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        done(null, jwt_payload.iss);
    }));
};
