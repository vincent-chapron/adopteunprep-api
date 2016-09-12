var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.pre('save', function(next) {
    let user = this;
    if (user.isModified('password') || user.isNew) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) {
                    return next(err); }

                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function(pw, cb) {
    let user = this;
    bcrypt.compare(pw, user.password, (err, isMatch) => {
        if (err) {
            return cb(err); }

        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
