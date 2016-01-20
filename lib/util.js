var http    = require('http');
var Podcast = require('podcast');

module.exports = {
    request   : request,
    toPodcast : toPodcast
};

function request(url, done) {
    try {
        http.request(url, done).end();
    } catch (ex) {
        done(ex);
    }
}

function toPodcast(feed) {
    var podcast = new Podcast({
        title         : feed.title,
        author        : feed.author,
        itunesAuthor  : feed.author,
        itunesImage   : feed.image,
        itunesSummary : feed.description
    });
    
    feed.episodes.forEach(function (ep) {
        podcast.item({
            title         : ep.title,
            url           : ep.url,
            date          : ep.date,
            enclosure     : ep.enclosure,
            itunesImage   : ep.image,
            itunesSummary : ep.description
        });
    });
    
    return podcast;
}
