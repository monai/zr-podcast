var fs       = require('fs');
var path     = require('path');
var minimist = require('minimist');
var util     = require('./util');
var scrape   = require('./scrape');
var daemon   = require('./daemon');
var pkg      = require('../package');

var argv;

argv = process.argv.slice(2);
argv = minimist(argv);

var argUrl     = argv._[0] || '';
var argDaemon  = !! (argv.d || argv.daemon);
var argHelp    = !! (argv.h || argv.help);
var argVersion = !! (argv.v || argv.version);

var helpFile = path.resolve(__dirname, '../assets/help.txt'); 

if (argHelp) {
    fs.createReadStream(helpFile)
    .pipe(process.stdout);
} else if (argVersion) {
    console.log(pkg.version);
} else if (argDaemon) {
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
