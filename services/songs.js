'use strict'

var Promise = require('bluebird');
var Songs = Promise.promisifyAll(require('../database/songs'));

exports.findAll = function(query) {
  return Songs.findAsync(query);
};

exports.findOneByQuery = function(query) {
  return Songs.findOneAsync(query);
};

exports.create = function(song) {
  return Songs.createAsync(song);
};

exports.remove = function(id) {
  return Songs.removeAsync(id);
};

exports.updateById = function(id, dataToUpdate) {
  return Songs.findByIdAndUpdateAsync(id, dataToUpdate,{new: true});
};
