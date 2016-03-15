'use strict'

var Promise = require('bluebird');
var _ = require('lodash');
var Songs = Promise.promisifyAll(require('../database/songs'));
var Ranks = Promise.promisifyAll(require('../database/ranks'));

exports.findAll = (query) =>{
  return Songs.findAsync(query);
};

exports.findOneByQuery = (query) =>{
  return Songs.findOneAsync(query);
};

// Merci à Mathieu d'avoir trouver comme faire ça
exports.findWhereIdIn = (array) => {
  return Songs.find({
    '_id': { $in: array}
  });
};

exports.create = (song) => {
  return Songs.createAsync(song);
};

exports.remove = (id) => {
  return Songs.removeAsync(id);
};

exports.updateById = (id, dataToUpdate) => {
  return Songs.findByIdAndUpdateAsync(id, dataToUpdate,{new: true});
};

exports.getTop5SongsByNotes = () => {
  var ranksSongs = [];
  return Ranks.aggregateAsync([
    {$group: {_id: "$song", avgNote: {$avg: "$rank"}}},
    {$sort: {avgNote: -1}},
    {$limit: 5}
  ])
  .then((ranks) => {
    var ids = _.map(ranks, '_id');
    ranksSongs = ranks;
    return Songs.find({_id: {$in: ids}});
  })
  .then((songs) => {
    return _.map(ranksSongs, (n) =>{
      var rank = _.clone(n);
      rank.song = _.find(songs, {_id: n._id});

      return rank;
    });
  })
};
