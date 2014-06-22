/* jshint strict: true */
/* jshint laxcomma: true */
/* global require, module */
/* global __dirname */


/**
 * Module dependencies.
 */

var express    = require('express');
var passport   = require('passport');
var bodyparser = require('body-parser');
var compresser = require('compression');
var session    = require('express-session');


/**
 * instantiate an `express` app
 * 
 * @type express
 */

var app = express();


/**
 * start a `http` server
 * 
 * @type server::http
 */

var server = require('http').createServer(app);


/**
 * start a `socket.io` server
 * 
 * @type server::socket
 */

var io = require('socket.io')(server);


/**
 * instantiate a redis store
 * for distributed socket.io
 * 
 * @type redis
 */

var socketstore = require('socket.io-redis');


/**
 * attach redis store to socket.io
 * 
 * @type redis
 */

io.adapter(socketstore({
  host: 'localhost', port: 6379
}));


/**
 * declare:
 *
 *  - `public`: static assets
 *  - `views` : ui models
 *  - `routes`: express routes
 * 
 * @type variables
 */

var pubdir = __dirname + '/public';
var views  = __dirname + '/views';
var routes = require('./lib/routes')(io);


/**
 * finally, tell `express`
 * how we want our `http`
 * server to be configured
 * 
 * @type `express`
 */

app.use(compresser());
app.use(bodyparser());
app.set('views', views);
app.set('view engine', 'jade');
app.use(express.static(pubdir, {maxAge: 31557600000}));
app.use(session({secret: 'jEs7dmvluCXL88paKoxZQUDlj3rBlc6c'}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);


/**
 * Expose `server`
 */

module.exports = server;
