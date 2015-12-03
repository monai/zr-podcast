var url = require('url');
var scrape = require('./scrape');

var argv = process.argv.slice(2);
var argUrl = argv[0] || '';
var showType = url.parse(argUrl).path || '';
showType = showType.split('/')[1];

if (showType && showType == 'laida') {
    scrape.scrapeShow({
        url: argUrl
    }, function (_, xml) {
        console.log(xml);
    });
} else {
    scrape.scrapeArchive({
        url: argUrl
    }, function (_, xml) {
        console.log(xml);
    });
}
