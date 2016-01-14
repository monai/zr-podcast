var Podcast = require('podcast');

module.exports = {
    toPodcast: toPodcast
};

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
