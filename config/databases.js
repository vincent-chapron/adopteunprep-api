let config_db = {};

module.exports = config_db;

config_db.mongo_db = process.env.API_MONGODB || 'mongodb://root:root@127.0.0.1:27018/adopteunprep';

config_db.model_users = {
    serializers: {
        owner: 'email'
    }
};
