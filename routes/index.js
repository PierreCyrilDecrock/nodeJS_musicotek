var express = require('express');
var router = express.Router();
var SongService = require('../services/songs');
var UsersService = require('../services/users');

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.accepts('text/html') || req.accepts('application/json')) {

    SongService.getTop5SongsByNotes()
      .then((songs) => {

        UsersService.lastThreeUsers()
          .then((users) => {
            if (req.accepts('text/html')) {
              return res.render('home', {top5: songs, newestUsers: users});
            }
            if (req.accepts('application/json')) {
              res.status(200).send({top5: songs, newestUsers: users});
            }
          })
        ;
      })
    ;
  }
  else {
      res.status(406).send({err: 'Not valid type for asked ressource'});
  }
});

router.get('/me', (req, res) => {
  if (req.accepts('text/html') || req.accepts('application/json')) {

    UsersService.findOneByQuery({_id: req.user})
      .then((user) => {
        if (!user) {
          res.status(404).send({err: 'No user found with id' + user.id});
          return;
        }

        SongService.findWhereIdIn(user.favoriteSongs).then((favoriteSongs) => {
          UsersService.findWhereIdIn(user.friendsList).then((friendsList) => {
            UsersService.findWhereIdIn(user.friendsRequest).then((friendsRequest) => {

              var isRequest = false
              req.user.friendsRequest.forEach((request) => {

                if(user.id == request){
                  isRequest = true
                }
              });

              var isFriend = false
              req.user.friendsList.forEach((friend) => {
                if(user.id == friend){
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
        });

      })
      .catch((err) => {

      })
    ;
  }
  else {
    res.status(406).send({err: 'Not valid type for asked ressource'});
  }
});

module.exports = router;
