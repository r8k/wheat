/* jshint strict: true */
/* jshint laxcomma: true */
/* global require, module */
/* global process, exports:true */


/**
 * Module dependencies.
 */

var util         = require('util');
var logger       = require('./logger');
var express      = require('express');
var router       = express.Router();
var crypto       = require('crypto');
var passport     = require('passport');
var redis        = require("redis").createClient();
var authstrategy = require('passport-local').Strategy;


/**
 * constant variables
 */

var io;
var mstoyear   = 31557600000/1000;
var cachexpiry = 'public, max-age=' + mstoyear;


/**
 * format substituted arguments
 * 
 * @api private
 */

function fmt(args) {
  'use strict';
  return util.format.apply(util.format, Array.prototype.slice.call(arguments));
}


/**
 * format a given message to:
 * 
 *   - [Fri Mar 08 2013 22:36:48] INFO: `str`
 * 
 * @param  data   message string
 * @api private
 */

function format(data) {
  'use strict';
  var ftime    = data.timestamp || new Date();
  var prefix   = '[' + (ftime).toLocaleString().slice(0,24) + ']';
  data.message = prefix + ' ' + (data.level || 'INFO') + ': ' + data.message;
  
  return data;
}


/**
 * creates and returns a `md5` hash
 * 
 * @param  str
 * @return md5hash
 * @api    private
 */

function md5hash(str) {
  'use strict';
  return crypto.createHash('md5').update(str).digest('hex');
}


/**
 * `authentication` module.
 * 
 *   - find a `user` from redis
 *   - with the given email_id
 *   - throw error, if not valid
 *   - throw error, if wrong pass
 *   - throw error, if redis error
 * 
 * @param  username   user email
 * @param  password   user password
 * @param  done       passport done `fn`
 * 
 * @api private
 */

function fetch(username, password, done) {
  'use strict';
  redis.hgetall('user::' + username, function(err, user) {
      if (err) {
        return done(err);
      } else if (!user) {
        return done(null, false, {
          message: 'unknown user ' + username
        });
      } else if (user.secret != md5hash(password)) {
        return done(null, false, {
          message: 'Invalid password'
        });
      }

      return done(null, user);
  });
}


/**
 * `authentication` entry point.
 * 
 * Loosely coupled from the actual logic
 * since the execution happens at the
 * `process.nextTick` eventloop.
 *
 * @see `fetch`
 */

function authenticate(user, pass, done) {
  'use strict';
  process.nextTick(function nextloop() {
    fetch(user, pass, done);
  });
}


/**
 * use `passport` for authentication
 */

passport.use(new authstrategy(authenticate));


/**
 * `serialize` a given user
 * 
 * @param  user
 * @param  done
 * @api    private
 * @todo   serialization thru redis
 */

passport.serializeUser(
  function serialize(user, done) {
    'use strict';
    done(null, user);
});


/**
 * `deserialize` a given user id
 * 
 * @param  id
 * @param  done
 * @api    private
 * @todo   deserialization thru redis
 */

passport.deserializeUser(
  function deserialize(id, done) {
    'use strict';
    done(null, id);
});


/**
 * provides the auth middleware
 * 
 * @api private
 */

function authmiddleware(req, res, next) {
  'use strict';
  return passport.authenticate('local', {
    failureRedirect: '/'
  })(req, res, next);
}


/**
 * `gatekeep` access to
 * restricted entry points
 * 
 * @param  req
 * @param  res
 * @param  next
 * @api    private
 */

function gatekeep(req, res, next) {
  'use strict';
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}


/**
 * User Login Route: redirects
 * 
 *   - to `Console` upon authentication
 *   - to `Login` upon failure
 * 
 * @param  req   `http` request
 * @param  res   `http` response
 * @api private
 */

function redirecttoconsole(req, res) {
  'use strict';
  res.redirect(fmt('/%s', req.body.appid));
}


/**
 * User Logout Route: redirects
 * 
 *   - to `Login` upon logout
 * 
 * @param  req   `http` request
 * @param  res   `http` response
 * @api private
 */

function userlogout(req, res){
  'use strict';
  req.logout();
  res.redirect('/');
}


/**
 * Index Route
 * 
 *   - serves `Login` page
 * 
 * @param  req   `http` request
 * @param  res   `http` response
 * @api private
 */

function indexpage(req, res) {
  'use strict';
  res.setHeader('cache-control', cachexpiry);
  res.render('index');
}


/**
 * Receive Logs from Users - Route
 * 
 * @param  req   `http` request
 * @param  res   `http` response
 * @api private
 */

function receivelogs(req, res) {
  'use strict';
  io.sockets
    .to(req.params.appid)
    .emit("logitem", format(req.body));

  res.send(202);
}


/**
 * `Log Console` Route
 * 
 *   - serves `Log Console` page
 * 
 * @param  req   `http` request
 * @param  res   `http` response
 * @api private
 */

function consolepage(req, res) {
  'use strict';
  res.setHeader('cache-control', cachexpiry);
  res.render('console');
}


/**
 * serve all other requests - Route
 * 
 *   upon successful auth:
 *     - redirect to `Console` page
 *
 *   upon failed auth:
 *     - redirect to `Login` page
 * 
 * @param  req   `http` request
 * @param  res   `http` response
 * @api private
 */

function redirecttologin(req, res) {
  'use strict';
  res.redirect('/');
}


/**
 * use `morgan` for logging
 */

router.use(logger);


/**
 * configure `routes`
 * for `express` app
 * 
 * @api public
 */

router.post('/', authmiddleware, redirecttoconsole);
router.get('/logout', userlogout);
router.get('/', indexpage);
router.post('/:appid', receivelogs);
router.get('/:appid', gatekeep, consolepage);
router.all('*', gatekeep, redirecttologin);


/**
 * `setup` socketio & return `router`
 *
 * @return `router`
 * @api public
 */

function setup(sock) {
  'use strict';
  io = sock;
  io.sockets.on('connection', function attach(socket) {
    socket.on('subscribe', function joinroom(data) {
      socket.join(data.room);
    });
  });
  
  return router;
}


/**
 * Expose `setup`
 */

exports = module.exports = setup;
