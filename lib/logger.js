/* jshint strict: true */
/* jshint laxcomma: true */
/* global require, module */
/* global exports:true */


/**
 * Module dependencies.
 */

var LOG = require('morgan');


/**
 * Define `responsetime` token
 * used in the `response` headers
 * 
 * @param  req   `http` request
 * @param  res   `http` response
 * @api private
 */

LOG.token('resptime', function(req, res) {
  'use strict';
  return res.get('x-response-time');
});


/**
 * Define Log Line format
 * 
 * @api private
 */
var LOG_LINE = '[:date] [IP - :remote-addr] ":method :url HTTP/:http-version :status :resptime [:res[content-length] Bytes]"';


/**
 * Instantiate `Morgan`
 * 
 * @api public
 */

var morgan = LOG({format: LOG_LINE});


/**
 * Expose `Morgan`
 */

exports = module.exports = morgan;