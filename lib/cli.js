var minimist = require('minimist');
var util = require('./util');
var scrape = require('./scrape');
var daemon = require('./daemon');

var argv, argUrl, argDaemon;

argv = process.argv.slice(2);
argv = minimist(argv);

argUrl = argv._[0] || '';
argDaemon = !! (argv.d || argv.daemon);

if (argDaemon) {
    daemon();
} else {
    scrape({ url: argUrl }, out);
}

function out(error, feed) {
    if (error) {
        console.error(error.stack);
    } else {
        console.log(util.toPodcast(feed).xml('  '));
    }
}
