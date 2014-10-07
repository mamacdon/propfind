/*eslint-env node*/
/*eslint no-unused-params:0*/

var http = require("http"),
    util = require("util");

var port = process.env.PORT;

http.createServer(function (req, res) {
	var msg = util.format("You sent: %s %s", req.method, req.url);
	console.log(msg);
	res.writeHead(200);
	res.end(msg + "\n");
}).listen(port);

console.log("Listening on " + port);
