/*eslint-env node*/
/*eslint no-unused-params:0*/
var http = require("http"),
    jade = require("jade"),
    util = require("util");

var methods = "PATCH PROPFIND PROPPATCH MKCOL COPY MOVE LOCK UNLOCK SEARCH".split(" ");

try {
	var externalPort = process.env.PORT,
	    app = JSON.parse(process.env.VCAP_APPLICATION),
	    uri = app.application_uris[0];
} catch (e) {
	// Running locally - remove this
	externalPort = 8228;
	app = {};
	uri = "localhost";
}

var results = {
	table: {},
	put: function(protocol, method, error, response) {
		var table = this.table;
		table[protocol] = table[protocol] || {};
		table[protocol][method] = error || response;
	}
};

function test() {
	["http", "https"].forEach(function(protocol) {
		methods.forEach(function(method) {
			var req = http.request({
				hostname: uri,
				method: method,
				port: protocol === "https" ? 443 : externalPort,
			}, function(res) {
				var body = "";
				res.setEncoding("utf8");
				res.on("data", function(chunk) {
					body += chunk;
				}).on("end", function() {
					var response;
					if (body === (method + " /")) {
						response = { pass: true, msg: body };
					} else {
						// Got a response but it was not what we sent
						response = { pass: false, msg: body };
					}
					console.log(util.format("%s %s: %s"), protocol, method, response.pass);
					results.put(protocol, method, null /*no error*/, response);
				});
			});
			req.on("error", function(err) {
				console.log(util.format("%s %s: %s", protocol, method, err));
				results.put(protocol, method, { pass: false, msg: err });
			});
			req.end();
		});
	});
}

function printResults() {
	console.log(results.table);
	return jade.renderFile(__dirname + "/views/results.jade", {
		protocols: results.table,
		url: uri
	});
}

http.createServer(function(req, res) {
	if (req.method === "GET") {
		res.writeHead(200, {"Content-Type": "text/html, charset=UTF-8"});
		res.end(printResults());
	} else {
		//console.log("Served a request for %s %s", req.method, req.url);
		res.writeHead(200);
		res.end(util.format("%s %s", req.method, req.url));
	}
}).listen(externalPort);

console.log("Listening on " + externalPort);
test();
