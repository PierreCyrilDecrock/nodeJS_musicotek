'use strict'
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
 username: {type: String, required: true},
 password: {type: String, required: true, select: false},
 displayName: {type: String, required: true},
 mail: {type: String, required: true},
 favoriteSongs: [mongoose.Schema.Types.ObjectId],
 friendsRequest: [mongoose.Schema.Types.ObjectId],
 friendsList: [mongoose.Schema.Types.ObjectId],
 // :+1
 createdAt: {type: Date, required: true, 'default': Date.now}
});

module.exports = mongoose.model('user', userSchema);
