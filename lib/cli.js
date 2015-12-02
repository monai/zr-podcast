var scrape = require('./scrape');

var argv = process.argv.slice(2);
var archiveUrl = argv.length && argv[0];

scrape({
    archiveUrl: archiveUrl
}, console.log);
