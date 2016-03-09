var express = require('express');
var router = express.Router();
var SongService = require('../services/songs');

router.get('/', function(req, res) {
  SongService.findAll(req.query || {}).then(function(songs) {
    if (req.accepts('text/html')) {
      return res.render('songs', {songs: songs});
    }
    if (req.accepts('application/json')) {
      return res.status(200).send(songs);
    }
  });
});


router.get('/add', function(req, res) {
  return res.render('add', {error: null});
});

var verifInput = function(req, res, next) {
  if(req.body.title && req.body.artist && req.body.album){
    next();
  }
  else{
    res.render('add', {error: '400', message: 'T\'as pas mis les bon champs du con'});
  }
};

router.post('/', verifInput, function(req, res) {
  SongService.create(req.body)
    .then(function(song){
      res.redirect('songs/'+song._id);
      // return res.render('song', {song: song});
    })
    .catch(function(err){
      res.status(500).send({err});
    })
});

router.get('/:id', function(req, res) {
  if (req.params.id.length !== 24) {
    res.status(404).send({err: 'Aucune musique connu avec un ID : ' + req.params.id});
    return; // important !!
  }
  if (req.accepts('text/html') || req.accepts('application/json')) {
    SongService.findOneByQuery({_id: req.params.id})
      .then(function(song) {
        if (!song) {
          res.status(404).send({err: 'No song found with id' + req.params.id});
          return;
        }
        if (req.accepts('text/html')) {
          return res.render('song', {song: song});
        }
        if (req.accepts('application/json')) {
          return res.status(200).send(song);
        }
    });
  }
  else {
    res.status(406).send({err: 'Not valid type for asked ressource'});
  }
});

router.get('/artist/:artist', function(req, res) {
  SongService.findAll({artist: req.params.artist})
    .then(function(song) {
      if (!song) {
        res.status(404).send({err: 'No song found with id' + req.params.id});
        return; // important !!
      }
      res.status(200).send(song);
    }).catch(function(err){
      res.status(500).send(err)
    });
});

router.post('/', function(req, res) {
  SongService.create(req.body).then(function(song){
    res.status(200).send(song);
  }).catch(function(err){
    res.status(500).send({err});
  })
});

router.delete('/', function(req, res) {
  SongService.remove().then(function(song){
    res.status(200).send(song);
  }).catch(function(err){
    res.status(500).send({err});
  })
});

router.delete('/:id', function(req, res) {
  if (req.params.id.length !== 24) {
    res.status(404).send({err: 'Aucune musique connu avec un ID : ' + req.params.id});
    return; // important !!
  }
  SongService.remove({_id: req.params.id}).then(function(song){
    res.status(200).send(song);
  }).catch(function(err){
    res.status(500).send({err});
  })
});

router.put('/:id', function(req, res) {
  if (req.params.id.length !== 24) {
    res.status(404).send({err: 'Aucune musique connu avec un ID : ' + req.params.id});
    return; // important !!
  }
  SongService.updateById(req.params.id, req.body).then(function(result){
    res.status(200).send(result);
  }).catch(function(err){
    res.status(500).send({err});
  })
});




module.exports = router;
