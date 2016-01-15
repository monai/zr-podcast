var url = require('url');
var http = require('http');
var util = require('./util');
var scrape = require('./scrape');

module.exports = daemon;

var env = process.env;
var conf = {
    HOST: env.HOST || '127.0.0.1',
    PORT: env.PORT || 3000
};

function daemon() {
    var server;
    
    server = http.createServer(handler);
    server.listen(conf.PORT, conf.HOST, function (error) {
        if (error) {
            console.error(error);
        } else {
            console.log('Listening on http://%s:%s', conf.HOST, conf.PORT);
        }
    });
}

function handler(req, res) {
    var argUrl, valid, domainRe;
    
    domainRe = /^(?:www\.)?ziniuradijas\.lt$/;
    argUrl = url.parse(req.url).path.slice(1);
    valid = argUrl && url.parse(argUrl).hostname;
    valid = valid && valid.match(domainRe);
    
    scrape({ url: argUrl }, function (error, feed) {
        if (error) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end(error.stack);
        } else {
            feed = util.toPodcast(feed).xml('  ');
            res.writeHead(200, {'Content-Type': 'application/rss+xml'});
            res.end(feed);
        }
    });
}