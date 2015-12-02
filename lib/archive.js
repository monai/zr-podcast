var request = require('request');
var cheerio = require('cheerio');
var moment  = require('moment');
var stream  = require('./stream');

var conf = {
    prefixUrl  : 'http://www.ziniuradijas.lt',
    archiveUrl : 'http://www.ziniuradijas.lt/archyvas/laidu-irasai'
};

module.exports = scrape;
function scrape(options, done) {
    if (options.archiveUrl) {
        conf.archiveUrl = options.archiveUrl;
    }
    
    request(conf.archiveUrl)
    .pipe(stream.buffer())
    .pipe(stream.toString())
    .pipe(parseArchive())
    .pipe(parseShow())
    .pipe(stream.bufferArray())
    .pipe(stream.writable(function (shows, done_) {
        done(null, shows);
        done_(null);
    }));
}

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