/* jshint strict: true */
/* jshint laxcomma: true */
/* global $, window:true */
/* global io, document:true */


/**
 * internal variables
 * 
 * @api private
 */

var lines = 0;
var buffer = $('#tail');


/**
 * rescale `console` height
 * based on the available
 * real estate height
 * 
 * @api public
 */

function rescale() {
  'use strict';
  $("#tail").height($(window).height() - 120);
}


/**
 * on.connect, subscribe to the room
 * 
 * @api public
 */

function subscribe() {
  'use strict';
  socket.emit("subscribe", {room: window.location.pathname.substring(1)});
  $("#info").html('watching logs');
}


/**
 * on.disconnect
 * 
 * @api public
 */
function disconnect() {
  'use strict';
  $("#info").html('sockets unplugged !!');
}


/**
 * handle incoming logs from sockers
 * 
 * @param  data     containing log records
 * @api public
 */

function handler(data) {
  'use strict';
  if (data.message) {
    var li = $('<li>');
    li.text(data.message);
    buffer.append(li);
    buffer.scrollTop(lines * 100);
    lines += 1;
  } else if (data.clear) {
    $('#tail').empty();
  }
}


/**
 * set console's height
 */

rescale();

/**
 * attach `rescale` to window's
 * resize event
 */

$(window).resize(rescale);

/**
 * instantiate sockets
 */

var socket = io.connect();

/**
 * attach event listeners
 */

socket.on('connect', subscribe);
socket.on('disconnect', disconnect);
socket.on('logitem', handler);


/**
 * print info, upon booting
 * 
 * @api public
 */

$(document).ready(function boot() {
  'use strict';
  $("#info").html('watching logs');
});


/**
 * upon click of `clear` element,
 * empty the console.
 * 
 * @api public
 */

$("#clear").bind('click', function() {
  'use strict';
  $('#tail').empty();
});


/**
 * upon press of `delete` button,
 * empty the console.
 * 
 * @api public
 */

$(window).bind('keydown', function(event) {
  'use strict';
  if(event.keyCode == 8){
    $('#tail').empty();
    event.preventDefault();
  }
});
