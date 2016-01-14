var url = require('url');
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
    var feed = Object.assign({}, conf.feed, { episodes: [] });
    
    if ( ! options.url) {
        options.url = conf.archiveUrl;
    }
    
    archive(options, function (_, shows) {
        stream.readArray(shows)
        .pipe(addShowToFeed(feed))
        .pipe(stream.writeNull())
        .on('finish', function () {
            done(null, feed);
        });
    });
}

function scrapeShow(options, done) {
    show(options, function (_, show) {
        var showId, showArchiveUrl, feed;
        
        showId = url.parse(options.url).path.split('/')[3];
        showAU = conf.archiveUrl +'?show_id='+ showId;
        
        feed = {
            title       : show.title,
            author      : show.author,
            image       : show.image,
            description : show.description,
            episodes    : []
        };
        
        archive({
            url: showAU
        }, function (_, shows) {
            stream.readArray(shows)
            .pipe(addShowToFeed(feed))
            .pipe(stream.writeNull())
            .on('finish', function () {
                done(null, feed);
            });
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
        
        feed.episodes.push({
            title       : show.title,
            description : show.description,
            url         : show.url,
            date        : show.date,
            image       : show.image,
            enclosure   : enclosure
        });
        
        done(null, show);
    });
}
