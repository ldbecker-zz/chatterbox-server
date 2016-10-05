var fs = require('fs');
var path = require('path');
var lineReader = require('readline');

/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var messages = [];

var getDate = function() {
  var time = new Date();
  return (('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2) + ':' + ('0' + time.getSeconds()).slice(-2) + ':' + ('0' + time.getMilliseconds()).slice(-2));
};

var requestHandler = function(request, response) {

  var saveMessages = function() {
    fs.writeFile('./messages.txt', JSON.stringify(messages), function() {});
  };

  var loadMessages = function() {
    fs.readFile('./messages.txt', function(err, data) {
      if (err) {
        messages = [];
        saveMessages();
      } else {
        messages = JSON.parse(data);
      }
    });
  };

  var loadStaticFile = function(filePath) {
    var strFile = '';
    fs.readFile('./client/client' + filePath, 'binary', function read(err, data) {
      if (err) {
        return;
      }
      strFile = data;
      if (filePath.endsWith('.gif')) {
        response.writeHead(200, {'Content-Type': 'image/gif'});
      }
      response.end(strFile, 'binary');
    });
    return;
  };

  if (request.url.endsWith('.js') || request.url.endsWith('.gif') || request.url.endsWith('.css')) {
    loadStaticFile(request.url);
    return;
  }

  if (request.url === '/' || request.url.includes('?username=')) {
    loadStaticFile('/index.html');
    return;
  } else {

    var statusCode = 200;

    var defaultCorsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type, accept',
      'access-control-max-age': 10 // Seconds.
    };
    
    var headers = defaultCorsHeaders;

    headers['Content-Type'] = 'application/json';

    if (request.method === 'POST') {
      statusCode = 201;
    } else if (request.method === 'GET' && (request.url.split('?')[0] !== '/classes/messages')) {
      statusCode = 404;
      response.writeHead(statusCode, headers);
      response.end();
    }

    response.writeHead(statusCode, headers);
    
    var options = {'order': '-createdAt', 'statusCode': 200, 'ended': true};
    
    if (request.method === 'OPTIONS') {
    } else if (request.method === 'GET') {
      loadMessages();
      if (options.order === undefined) {
        options.results = messages;
      } else if (options.order = '-createdAt') {
        options.results = messages.sort(function(a, b) {
          if (a.createdAt > b.createdAt) {
            return -1;
          } else {
            return 1;
          }
        });
      }
      
    } else if (request.method === 'POST') {
      options['statusCode'] = 201;
      response.statusCode = 201;
      var body = '';
      request.on('data', function (data) {
        body += data;
      });

      request.on('end', function() {
        var post = JSON.parse(body);
        post['createdAt'] = getDate();
        post['objectId'] = post['createdAt'];
        messages.unshift(post);
        if (messages.length === 101) {
          messages.pop();
        }
        
        saveMessages();
        options['results'] = messages;
        
        response.end(JSON.stringify(options));
      });
    }

    if (request.method !== 'POST') {
      response.end(JSON.stringify(options));
    }
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
module.exports.requestHandler = requestHandler;
