/*eslint-env node*/
/*eslint no-unused-params:0*/
var http = require("http"),
    https = require("https"),
    jade = require("jade"),
    url = require("url"),
    util = require("util");

var methods = ["COPY", "LOCK", "MKCOL", "MOVE", "PATCH", "PROPFIND", "PROPPATCH", "SEARCH", "UNLOCK"];

try {
	var internalPort = process.env.PORT,
	    uri = JSON.parse(process.env.VCAP_APPLICATION).application_uris[0],
	    isLocal = false;
} catch (e) {
	// Running locally - remove this
	isLocal = true;
	internalPort = 8228;
	uri = "localhost";
	//uri = "propfind.mybluemix.net";
	//uri = "propfind.cfapps.io";
}

var results = {
	table: {},
	clear: function() {
		this.table = {};
	},
	put: function(protocol, method, error, response) {
		var table = this.table;
		table[protocol] = table[protocol] || {};
		table[protocol][method] = error || response;
	}
};

function test() {
	function putResult(protocol, method, pass, incomingMessage, body, error) {
		var result = {
			pass: pass,
			response: incomingMessage || null,
			body: body,
			error: error,
		};
		results.put(protocol, method, result);
	}

	console.log(util.format("Running tests against %s...", uri));
	results.clear();
	["http", "https"].forEach(function(protocol) {
		methods.forEach(function(method) {
			var options = {
				hostname: uri,
				method: method,
				port: protocol === "http" ? 80 : 443,
			};
			if (isLocal) {
				options.port = internalPort; // can't rely on default port 80/443 for local case
			}
			var req = ("http" === protocol ? http : https).request(options, function(res) {
				var body = "";
				res.setEncoding("utf8");
				res.on("data", function(chunk) {
					body += chunk;
				}).on("end", function() {
					var ok = true, expectedBody = (method + " /");
					if (body !== expectedBody) {
						// Got a response but it was not what we expected
						ok = false;
					}
					console.log(util.format("%s %s: %s"), protocol, method, ok);
					putResult(protocol, method, ok, res, body);
				});
			});
			req.on("error", function(err) {
				console.log(util.format("%s %s: %s", protocol, method, err));
				putResult(protocol, method, false, null, null, err);
			});
			req.end();
		});
	});
}

function printResults() {
	return jade.renderFile(__dirname + "/views/results.jade", {
		protocols: results.table,
		url: uri
	});
}

http.createServer(function(req, res) {
	if (req.method === "GET" && url.parse(req.url).query === "refresh") {
		res.end("Running tests again. Please wait a sec and refresh.");
	} else if (req.method === "GET") {
		res.writeHead(200, {"Content-Type": "text/html, charset=UTF-8"});
		res.end(printResults());
	} else {
		//console.log("Served a request for %s %s", req.method, req.url);
		res.writeHead(200);
		res.end(util.format("%s %s", req.method, req.url));
	}
}).listen(internalPort);
console.log("Listening on port " + internalPort);
setTimeout(test, 1000);
