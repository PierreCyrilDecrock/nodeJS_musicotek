'use strict'

var mongoose = require('mongoose');

var rankSchema = mongoose.Schema({
  rank: {type: Number, required: true},
  song: {type: mongoose.Schema.Types.ObjectId, required: true},
  username: {type: String, required: true}
});

module.exports = mongoose.model('rank', rankSchema);
