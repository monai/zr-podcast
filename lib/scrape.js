var Podcast = require('podcast');
var archive = require('./archive');
var stream  = require('./stream');

var conf = {
    feed : {
        title    : 'Žinių radijas',
        feed_url : 'http://example.com'
    }
};

var feed = new Podcast(conf.feed);

module.exports = scrape;
function scrape(options, done) {
    archive(options, function (_, shows) {
        stream.readArray(shows)
        .pipe(addShowToFeed(feed))
        .pipe(stream.writable(function (_, done_) {
            done(null, feed.xml('  '));
            done_(null);
        }));
    });
}

function addShowToFeed(feed) {
    return stream.transform(function (show, done) {
        var enclosure;
        
        if (show.videoUrl) {
            enclosure = {
                url  : show.videoUrl,
                mime : 'video/mp4'
            };
        } else {
            enclosure = {
                url  : show.audioUrl,
                mime : 'video/mpeg'
            };
        }
        
        feed.item({
            title       : show.title,
            description : show.desc,
            url         : show.url,
            date        : show.date,
            itunesImage : show.image,
            enclosure   : enclosure
        });
        
        done(null, show);
    });
}
