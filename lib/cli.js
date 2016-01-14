var url = require('url');
var util = require('./util');
var scrape = require('./scrape');

var argv = process.argv.slice(2);
var argUrl = argv[0] || '';
var showType = url.parse(argUrl).path || '';
showType = showType.split('/')[1];

if (showType && showType == 'laida') {
    scrape.scrapeShow({
        url: argUrl
    }, out);
} else {
    scrape.scrapeArchive({
        url: argUrl
    }, out);
}

function out(_, feed) {
    console.log(util.toPodcast(feed).xml('  '));
}
