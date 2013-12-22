var mongoose = require('mongoose');

mongoose.Model.paginate = function(query, page, records, callback){
    page || (page = 1);
    page = Math.abs(Number(page));

    var from = (page * records) - records;

    query.skip(from).limit(records).exec(function(err, results){
        if(err) return callback(err);

        // mongoose v3.8+ won't allow sort on query.count()
        // removing temporary query options
        var o = query.options;
        query.options = {};

        query.count(function(err, count){
            // restoring query options? not necessarily needed?
            query.options = o;
            callback(err, results, count, Math.ceil(count / (records || count)));
        });

    });
};