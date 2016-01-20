var url     = require('url');
var stream  = require('stream-util2');
var archive = require('./archive');
var show    = require('./show');

var conf = {
    archiveUrl: 'http://www.ziniuradijas.lt/archyvas/laidu-irasai',
    feed: {
        title: 'Žinių radijas',
        image: 'http://www.ziniuradijas.lt/system/content/content/000/000/050/rsz_Žr_logas.jpg'
    }
};

module.exports = scrape;
Object.assign(module.exports, {
    scrapeArchive : scrapeArchive,
    scrapeShow    : scrapeShow
});

function scrape(options, done) {
    var showType;
    
    showType = url.parse(options.url).path || '';
    showType = showType.split('/')[1];
    
    if (showType && showType == 'laida') {
        scrapeShow(options, done);
    } else {
        scrapeArchive(options, done);
    }
}

function scrapeArchive(options, done) {
    var feed = Object.assign({}, conf.feed, { episodes: [] });
    
    if ( ! options.url) {
        options.url = conf.archiveUrl;
    }
    
    archive(options, function (error, shows) {
        if (error) {
            done(error);
        } else {
            stream.readArray(shows)
            .pipe(addShowToFeed(feed))
            .pipe(stream.writeNull())
            .on('finish', function () {
                done(null, feed);
            });
        }
    });
}

function scrapeShow(options, done) {
    show(options, function (error, show) {
        var showId, showArchiveUrl, feed;
        
        if (error) {
            done(error);
        } else {
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
            }, function (error, shows) {
                if (error) {
                    done(error);
                } else {
                    stream.readArray(shows)
                    .pipe(addShowToFeed(feed))
                    .pipe(stream.writeNull())
                    .on('finish', function () {
                        done(null, feed);
                    });
                }
            });
        }
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
