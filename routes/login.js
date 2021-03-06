var express = require('express');
var router = express.Router();
var passport = require('passport');


router.get('/', (req, res) => {
  if (req.accepts('text/html')) {
    res.render('login');
  }
  else {
    res.send(406, {err: 'Not valid type for asked ressource'});
  }
});

router.post('/',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

module.exports = router;
