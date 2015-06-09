var MongoClient = require('mongodb').MongoClient,
    config = require('./conf');

function executeWithDb(callback) {
    MongoClient.connect(config.dbUrl, function (err, db) {
        //TODO handle err
        callback(db).finally(function () {
            db.close();
        });
    });
}

module.exports = {
    executeWithDb: executeWithDb
};