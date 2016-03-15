'use strict'

var Promise = require('bluebird');
var Ranks = Promise.promisifyAll(require('../database/ranks'));

exports.findOneByQuery = (query) => {
    return Ranks.findOneAsync(query);
};

exports.create = (rank) => {
    return Ranks.createAsync(rank);
};

exports.ranks = () => {
    return Ranks;
}
