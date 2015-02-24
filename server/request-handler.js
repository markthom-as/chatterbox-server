var path = require('path');
var fs = require('fs');

/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
  var messages = {
    results : [
      {text: "LOL", room: 'lobby'}
    ]
    // lobby : []
  };

 var requestHandler = function(request, response) {
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
  console.log("Serving request type " + request.method + " for url " + request.url);

  var content = ''
  var fileName = path.basename(request.url);

  if((request.url.split("/").length -1) > 1){
    fileName = request.url;
  }
  localFolder = __dirname + '/../client/';

  if(fileName === 'index.html' || fileName.indexOf('.') !== -1){
    content = localFolder + fileName;
    fs.readFile(content, function(err, contents){
      if(!err){
        var headers = defaultCorsHeaders;
        headers['Content-Type'] = "text/html";
        var statusCode = 200;
        response.writeHead(statusCode, headers);
        console.log(contents);
        response.end(contents);
      }else{
        console.dir(err);
      }
    })
  }else{

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = "text/plain";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.


  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  var responseArray = [];
  if(request.method === "POST"){
    request.on('data', function(chunk){
      chunk = JSON.parse(chunk);
      chunk.room = chunk.room || request.url.slice(9);
      if (request.url){
        chunk.objectID = messages.length;
        messages.results.push(chunk);

        if(messages[chunk.room] !== undefined){
          messages[chunk.room].push(chunk);
        }else{
          messages[chunk.room] = [];
          messages[chunk.room].push(chunk);
        }
      }
    });
    statusCode = 201;
  }else if(request.method === "GET"){
    if(request.url === '/classes/messages'){
      statusCode = 200;
      responseArray = messages.results;
    }else if(request.url.indexOf('/classes/') === 0 && messages[request.url.slice(9)] !== undefined){
      responseArray = messages[request.url.slice(9)];
    }else if(request.url.indexOf('classes') === -1){
      responseArray = [];
      statusCode = 404;
    }
  }

  response.writeHead(statusCode, headers);
  response.end(JSON.stringify({results: responseArray}));
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
defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};


module.exports = requestHandler;

