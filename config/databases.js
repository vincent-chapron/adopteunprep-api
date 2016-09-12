let config_db = {};

module.exports = config_db;

config_db.mongo_db = process.env.API_MONGODB || 'mongodb://_test:_test@localhost/test';

config_db.model_users = {
    serializers: {
        owner: 'email'
    }
};
