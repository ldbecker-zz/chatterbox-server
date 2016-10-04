var fs = require('fs');
var path = require('path');

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
  var loadStaticFile = function(filePath) {
    var strFile = '';
    fs.readFile('/Users/student/LucasVien/2016-09-chatterbox-server/client/client' + filePath, 'binary', function read(err, data) {
      if (err) {
        throw err;
      }
      strFile = data;
      response.end(strFile);
    });
    return;
  };
  if (request.url.endsWith('.js') || request.url.endsWith('.gif') || request.url.endsWith('.css')) {
    loadStaticFile(request.url);
    return;
  }

  if (request.url === '/' || request.url.includes('?username=')) {
    console.log('Page Accessed');
    loadStaticFile('/index.html');
    return;
  } else {
    // Request and Response come from node's http module.
    //
    // They include information about both the incoming request, such as
    // headers and URL, and about the outgoing response, such as its status
    // and content.
    //
    // Documentation for both request and response can be found in the HTTP section at
    // http://nodejs.org/documentation/api/

    // Do some basic logging.
    //
    // Adding more logging to your server can be an easy way to get passive
    // debugging help, but you should always be careful about leaving stray
    // console.logs in your code.
    
    //console.log('Serving request type ' + request.method + ' for url ' + request.url);

    var statusCode = 200;

    var defaultCorsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type, accept',
      'access-control-max-age': 10 // Seconds.
    };
    // See the note below about CORS headers.
    var headers = defaultCorsHeaders;

    // Tell the client we are sending them plain text.

    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    
    //headers['Content-Type'] = 'text/plain';
    headers['Content-Type'] = 'application/json';

    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.

    if (request.method === 'POST') {
      statusCode = 201;
    } else if (request.method === 'GET' && (request.url.split('?')[0] !== '/classes/messages')) {
      console.log('404. Url = ' + request.url);
      statusCode = 404;
    }

    response.writeHead(statusCode, headers);
    var optionsArr = request.url.substr(2).split('&');
    var options = {'order': '-createdAt', 'statusCode': 200, 'ended': true};
    optionsArr.forEach(function(elem) {
      var splitElem = elem.split('=');
      options[splitElem[0]] = splitElem[1];
    });
    if (request.method === 'OPTIONS') {
      //console.log('OPTIONS REQUEST. Options = ' + JSON.stringify(options));
      //response.write('start');
      //response.write(JSON.stringify(options));
    } else if (request.method === 'GET') {
      
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
        options['results'] = messages;
        //options = {'createdAt': post.createdAt, 'objectId': post.objectId};
        response.end(JSON.stringify(options));
      });
    }

    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.
    //console.log(response);
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
