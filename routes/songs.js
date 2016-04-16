var express = require('express');
var router = express.Router();
var SongService = require('../services/songs');
var RankService = require('../services/ranks');
var UsersService = require('../services/users');


///// GET /////

router.get('/', (req, res) => {
  if (req.accepts('text/html') || req.accepts('application/json')) {

    var attributes = ["title", "album", "artist", "year", "bpm"];
    var params = {};

    // Take each option of the URL to search
    attributes.forEach((attribute) => {
      if (req.query[attribute]) {
        params[attribute] = req.query[attribute];
      }
    })

    SongService.findAll(params)
      .then((songs) => {
        if (req.accepts('text/html')) {
          return res.render('songs', {songs: songs});
        }
        if (req.accepts('application/json')) {
          res.status(200).send(songs);
        }
      })
    ;
  }
  else {
      res.status(406).send({err: 'Not valid type for asked ressource'});
  }
});


router.get('/add', (req, res) => {
  return res.render('add', {error: null});
});

var verifInput = (req, res, next) => {
  if(req.body.title && req.body.artist && req.body.album){
    next();
  }
  else{
    res.render('add', {error: '400', message: 'T\'as pas mis les bon champs du con'});
  }
};

router.get('/:id', (req, res) => {
  if (req.params.id.length !== 24) {
    res.status(404).send({err: 'Aucune musique connu avec un ID : ' + req.params.id});
    return; // important !!
  }
  if (req.accepts('text/html') || req.accepts('application/json')) {
    SongService.findOneByQuery({_id: req.params.id})
      .then((song) => {
        if (!song) {
          res.status(404).send({err: 'No song found with id' + req.params.id});
          return;
        }
        if (req.accepts('text/html')) {
          var rank = {
            username: req.user.username,
            song: song._id,
          };

          var isFavorite = false
          req.user.favoriteSongs.forEach((favoriteSong) => {

            if(favoriteSong == song._id){
              isFavorite = true
            }
          });

          RankService.ranks().findOne(rank, (err, rank) => {
            res.render('song', {song: song, rank: rank, isFavorite: isFavorite});
          });

          return;
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

router.get('/artist/:artist', (req, res) => {
  SongService.findAll({artist: req.params.artist})
    .then((song) => {
      if (!song) {
        res.status(404).send({err: 'No song found with id' + req.params.id});
        return; // important !!
      }
      res.status(200).send(song);
    }).catch((err) => {
      res.status(500).send(err)
    });
});


///// POST /////

router.post('/', verifInput, (req, res) => {
  SongService.create(req.body)
    .then((song) => {
      res.redirect('songs/'+song._id);
      // return res.render('song', {song: song});
    })
    .catch((err) =>{
      res.status(500).send({err});
    })
});

router.post('/:id/rank', (req, res) => {
  SongService.findOneByQuery({_id: req.params.id})
    .then((song) => {
      if (!song) {
        res.status(404).send({err: 'No song found with id' + req.params.id});
        return;
      }

      var newRank = {
        username: req.user.username,
        song: song._id,
      };

      RankService.findOneByQuery(newRank)
        .then((rank) => {

          if (rank) {
            res.status(403).send();
              // je mettrais plutôt un 409 Conflict
            return;
          }

          newRank.rank = req.body.rank;

          RankService.create(newRank)
            .then((rank) => {
              if (req.accepts('text/html')) {
                return res.redirect('/songs/' + song._id);
              }

              if (req.accepts('application/json')) {
                return res.status(200).send(song);
              }
            })
            .catch((err) => {
                res.status(500).send(err);
            })
          ;

        })
        .catch((err) => {
            res.status(500).send(err);

        })
      ;
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send(err);

    })
  ;
})

router.post('/:id/addFavorite', (req, res) => {
    // l'url ne fait reference à l'utilisateur qu'on va modifier, ça aurait pu être POST /users/me/songs/:song_id/favorites/
    // cependant la logique est ok
    UsersService.addFavoritesToUser(req.user._id, req.params.id)
      .then((user) => {
        req.logIn(user, (error) => {
          if (!error) {
            if (req.accepts('text/html')) {
              return res.redirect("/songs/" + req.params.id);
            }
            if (req.accepts('application/json')) {
              res.status(201).send(user);
            }
          }
        })
      })
      .catch((err) => {
        res.status(500).send(err);
      })
    ;
});

router.post('/:id/deleteFavorite', (req, res)  => {
  UsersService.deleteFavoritesToUser(req.user._id, req.params.id)
    .then((user) => {
      req.logIn(user, (error) => {
          if (!error) {
            if (req.accepts('text/html')) {
              return res.redirect("/users/" + req.user._id);
            }
            if (req.accepts('application/json')) {
              res.status(201).send(user);
            }
          }
        })
    })
    .catch((err) => {
      res.status(500).send({err});
    })
  ;
});

router.post('/deleteAllFavorite', (req, res)  => {
  UsersService.deleteAllFavoritesToUser(req.user._id)
    .then((user) => {
      req.logIn(user, (error) => {
          if (!error) {
            if (req.accepts('text/html')) {
              return res.redirect("/users/" + req.user._id);
            }
            if (req.accepts('application/json')) {
              res.status(201).send(user);
            }
          }
        })
    })
    .catch((err) => {
      res.status(500).send({err});
    })
  ;
});

router.post('/', (req, res) => {
  SongService.create(req.body).then((song) => {
    res.status(200).send(song);
  }).catch((err) =>{
    res.status(500).send({err});
  })
});


///// DELETE /////

router.delete('/', (req, res) => {
  SongService.remove().then((song) => {
    res.status(200).send(song);
  }).catch((err) => {
    res.status(500).send({err});
  })
});

router.delete('/:id', (req, res) => {
  if (req.params.id.length !== 24) {
    res.status(404).send({err: 'Aucune musique connu avec un ID : ' + req.params.id});
    return; // important !!
  }
  SongService.remove({_id: req.params.id}).then((song) => {
    res.status(200).send(song);
  }).catch((err) => {
    res.status(500).send({err});
  })
});




///// PUT /////

router.put('/:id', (req, res) => {
  if (req.params.id.length !== 24) {
    res.status(404).send({err: 'Aucune musique connu avec un ID : ' + req.params.id});
    return; // important !!
  }
  SongService.updateById(req.params.id, req.body).then((result) => {
    res.status(200).send(result);
  }).catch((err) => {
    res.status(500).send({err});
  })
});




module.exports = router;
