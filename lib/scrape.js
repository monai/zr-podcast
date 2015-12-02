var url = require('url');
var Podcast = require('podcast');
var archive = require('./archive');
var show    = require('./show');
var stream  = require('./stream');

var conf = {
    archiveUrl: 'http://www.ziniuradijas.lt/archyvas/laidu-irasai',
    feed: {
        title: 'Žinių radijas'
    }
};

module.exports = {
    scrapeArchive : scrapeArchive,
    scrapeShow    : scrapeShow
};

function scrapeArchive(options, done) {
    var feed = new Podcast(conf.feed);
    
    if ( ! options.archiveUrl) {
        options.archiveUrl = conf.archiveUrl;
    }
    
    archive(options, function (_, shows) {
        stream.readArray(shows)
        .pipe(addShowToFeed(feed))
        .pipe(stream.writable(function (_, done_) {
            done(null, feed.xml('  '));
            done_(null);
        }));
    });
}

function scrapeShow(options, done) {
    show(options, function (_, show) {
        var showId, showArchiveUrl, feed;
        
        showId = url.parse(options.url).path.split('/')[3];
        showAU = conf.archiveUrl +'?show_id='+ showId;
        feed = new Podcast({
            title         : show.title,
            itunesAuthor  : show.author,
            itunesImage   : show.image,
            itunesSummary : show.desc
        });
        
        archive({
            archiveUrl: showAU
        }, function (_, shows) {
            stream.readArray(shows)
            .pipe(addShowToFeed(feed))
            .pipe(stream.writable(function (_, done_) {
                done(null, feed.xml('  '));
                done_(null);
            }));
            
            done(null, feed.xml('  '));
        });
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
