'use strict'

var Promise = require('bluebird');
var Users = Promise.promisifyAll(require('../database/users'));

exports.find = (query) =>{
    return Users.findAsync(query);
};

exports.findOneByQuery = (query) =>{
 return Users.findOneAsync(query);
};

exports.findWhereIdIn = (array) => {
  return Users.find({
    '_id': { $in: array}
  });
};

exports.lastThreeUsers = () =>{
  return Users.find({}).sort('-createdAt').limit(3);
};

exports.createUser = (user) =>{
 return Users.createAsync(user);
};

exports.addFavoritesToUser = (user_id, song_id) => {
  return Users.findOneAndUpdateAsync(
    {_id: user_id},
    {$push: {favoriteSongs: song_id}},
    {new: true}
  );
};

exports.deleteFavoritesToUser = (user_id, song_id) => {
  return Users.findOneAndUpdateAsync(
    {_id: user_id},
    {$pull: {favoriteSongs: song_id}},
    {new: true}
  );
};

exports.deleteAllFavoritesToUser = (user_id) => {
  return Users.findOneAndUpdateAsync(
    {_id: user_id},
    {favoriteSongs: []},
    {new: true}
  );
};

// Pour ajouter une demande dans la liste des request
exports.addFriendsRequestToUser = (friend_id, user_id) => {
  return Users.findOneAndUpdateAsync(
    {_id: friend_id},
    {$push: {friendsRequest: user_id}},
    {new: true}
  );
};

// Pour supprimer une demande dans la liste des request
exports.deleteFriendsRequestToUser = (friend_id, user_id) => {
  return Users.findOneAndUpdateAsync(
    {_id: user_id},
    {$pull: {friendsRequest: friend_id}},
    {new: true}
  );
};

// Pour ajouter un ami dans la liste des amis
exports.addFriendsToUser = (friend_id, user_id) => {
  return Users.findOneAndUpdateAsync(
    {_id: friend_id},
    {$push: {friendsList: user_id}},
    {new: true}
  );
};


