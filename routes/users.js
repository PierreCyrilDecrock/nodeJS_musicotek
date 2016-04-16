var express = require('express');
var router = express.Router();
var UsersService = require('../services/users');
var SongService = require('../services/songs');

/* GET users listing. */
router.get('/', (req, res, next) => {
  if (req.accepts('text/html') || req.accepts('application/json')) {

    var attributes = ["username", "mail"];
    var params = {};

    attributes.forEach((attribute) => {
      if (req.query[attribute]) {
        params[attribute] = req.query[attribute];
      }
    })

    UsersService.find(params)
      .then((users) => {
        if (req.accepts('text/html')) {
          return res.render('users', {users: users});
        }
        if (req.accepts('application/json')) {
          res.status(200).send(users);
        }
      })
    ;
  }
  else {
      res.status(406).send({err: 'Not valid type for asked ressource'});
  }
});

router.get('/:id', (req, res) => {

  if (req.accepts('text/html') || req.accepts('application/json')) {
    UsersService.findOneByQuery({_id: req.params.id})
      .then((user) => {
        if (!user) {
          res.status(404).send({err: 'No user found with id' + req.params.id});
          return;
        }

        SongService.findWhereIdIn(user.favoriteSongs).then((favoriteSongs) => {
          UsersService.findWhereIdIn(user.friendsList).then((friendsList) => {
            UsersService.findWhereIdIn(user.friendsRequest).then((friendsRequest) => {

              var isRequest = false
              user.friendsRequest.forEach((request) => {
                if(req.user._id == request){
                  isRequest = true
                }
              });

              var isFriend = false
              user.friendsList.forEach((friend) => {
                if(req.user._id == friend){
                  isFriend = true
                }
              });

              if (req.accepts('text/html')) {
                res.render('user', {profile: user, favoriteSongs: favoriteSongs,friendsList: friendsList, friendsRequest: friendsRequest, isRequest: isRequest, isFriend: isFriend});
                return;
              }

              if (req.accepts('application/json')) {
                res.status(200).send(user);
                return;
              }
            });
          });
        })
      })
      .catch((err) => {

      })
    ;
  }
  else {
    res.status(406).send({err: 'Not valid type for asked ressource'});
  }
});

///// POST /////

// Faire une demande d'ami
router.post('/:id/request', (req, res) => {

    UsersService.addFriendsRequestToUser(req.params.id, req.user._id)
      .then((user) => {
          // sit u vas pas utiliser user dans ton bloc, vaut mieux pas le definir alors
        req.logIn(req.user, (error) => {
          if (!error) {
            if (req.accepts('text/html')) {
              return res.redirect("/users/" + req.params.id);
            }
            if (req.accepts('application/json')) {
              res.status(201).send(users);
            }
          }
        })
      })
      .catch((err) => {
        res.status(500).send(err);
      })
    ;
});

// Accepter une demande d'ami
router.post('/:id/accept', (req, res) => {


    // Ajout dans de mon id dans la liste d'ami de notre ami
    UsersService.addFriendsToUser(req.params.id, req.user._id)
      .then((user) => {
        // Ajout de l'id de mon ami dans ma liste d'ami
        UsersService.addFriendsToUser(req.user._id, req.params.id)
          .then((user) => {
          // Suppression de sa demande d'ami dans la liste de request
          UsersService.deleteFriendsRequestToUser(req.params.id, req.user._id)
            .then((user) => {
              req.logIn(req.user, (error) => {
                if (!error) {
                  if (req.accepts('text/html')) {
                    return res.redirect("/users/" + req.user._id);
                  }
                  if (req.accepts('application/json')) {
                    res.status(201).send(users);
                  }
                }
              })
          })
        })
      })
      .catch((err) => {
        res.status(500).send(err);
      })
    ;
});

// Décliner une demande d'ami
router.post('/:id/decline', (req, res) => {

    UsersService.deleteFriendsRequestToUser(req.params.id, req.user._id)
      .then((user) => {
        req.logIn(req.user, (error) => {
          if (!error) {
            if (req.accepts('text/html')) {
              return res.redirect("/users/" + req.user._id);
            }
            if (req.accepts('application/json')) {
              res.status(201).send(users);
            }
          }
        })
      })
      .catch((err) => {
        res.status(500).send(err);
      })
    ;
});

module.exports = router;
