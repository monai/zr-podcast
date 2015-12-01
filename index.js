var request = require('request');
var cheerio = require('cheerio');
var moment  = require('moment');
var Podcast = require('podcast');
var stream  = require('./stream');

var conf = {
    prefixUrl  : 'http://www.ziniuradijas.lt',
    archiveUrl : 'http://www.ziniuradijas.lt/archyvas/laidu-irasai',
    feed       : {
        title    : 'Žinių radijas',
        feed_url : 'http://example.com'
    }
};

var feed = new Podcast(conf.feed);

request(conf.archiveUrl)
.pipe(stream.buffer())
.pipe(stream.toString())
.pipe(parseArchive())
.pipe(parseShow())
.pipe(addShowToFeed(feed))
// .pipe(stream.writeConsole())
.pipe(stream.writeNull())
.on('finish', function () {
    console.log(feed.xml('  '));
});

function parseArchive() {
    return stream.transform(function (doc, done) {
        var self, $, $entries;
        
        self = this;
        $ = cheerio.load(doc);
        $entries = $('.search-container .entry');
        $entries.each(function (i, entry) {
            var $entry = $(entry);
            
            var $h1   = $entry.find('h1').first();
            var $h1a  = $h1.find('a').first();
            var $h1p  = $h1.find('p').first();
            var $img  = $entry.find('img').first();
            var $desc = $entry.find('.wysihtml5-content p').first();
            
            var url   = $h1a.attr('href');
            var img   = $img.attr('src');
            var title = $h1a.text().trim();
            var date  = $h1p.text().trim();
            var desc  = $desc.text().trim();
            
            self.push({
                url   : conf.prefixUrl + url,
                title : title,
                date  : moment(title, 'YYYY-MM-DD').toDate(),
                image : img,
                desc  : desc
            });
        });
        
        done(null);
    });
}

function parseShow() {
    return stream.transform(function (show, next) {
        var self = this;
        request(show.url)
        .pipe(stream.buffer())
        .pipe(stream.toString())
        .pipe(extractMedia())
        .pipe(stream.writable(function (parsed, done) {
            show.videoUrl = parsed.videoUrl;
            show.audioUrl = parsed.audioUrl;
            self.push(show);
            done(null);
            next(null);
        }));
    });
}

function extractMedia() {
    return stream.transform(function (show, done) {
        var self = this;
        
        var $ = cheerio.load(show);
        var $video = $('.hot-new-video').first();
        var $audio = $('.show-content a.download').first();
        
        var videoUrl = $video.attr('data-url');
        var audioUrl = $audio.attr('href');
        
        self.push({
            videoUrl : videoUrl,
            audioUrl : audioUrl
        });
        
        done(null);
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
