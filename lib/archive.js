var http    = require('http');
var cheerio = require('cheerio');
var moment  = require('moment');
var stream  = require('stream-util2');
var util    = require('./util');

var conf = {
    prefixUrl: 'http://www.ziniuradijas.lt'
};

module.exports = scrape;
function scrape(options, done) {
    util.request(options.url, (error, res) => {
        if (error) {
            done(error);
        } else {
            res.on('error', done)
            .pipe(stream.buffer())
            .pipe(stream.toString())
            .pipe(parseArchive())
            .pipe(parseShow())
            .on('error', done)
            .pipe(stream.bufferArray())
            .pipe(stream.writable((shows, done_) => {
                done(null, shows);
                done_(null);
            }));
        }
    });
}

function parseArchive() {
    return stream.transform(function (doc, done) {
        var $, $entries;
        
        $ = cheerio.load(doc);
        $entries = $('.search-container .entry');
        $entries.each((i, entry) => {
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
            
            this.push({
                url         : conf.prefixUrl + url,
                title       : title,
                date        : moment(date, 'YYYY-MM-DD').toDate(),
                image       : img,
                description : desc
            });
        });
        
        done(null);
    });
}

function parseShow() {
    return stream.transform(function (show, next) {
        util.request(show.url, (error, res) => {
            if (error) {
                done(error);
            } else {
                res.on('error', next)
                .pipe(stream.buffer())
                .pipe(stream.toString())
                .pipe(extractMedia())
                .pipe(stream.writable((parsed, done) => {
                    show.videoUrl = parsed.videoUrl;
                    show.audioUrl = parsed.audioUrl;
                    this.push(show);
                    done(null);
                    next(null);
                }));
            }
        });
    });
}

function extractMedia() {
    return stream.transform(function (show, done) {
        var $ = cheerio.load(show);
        var $video = $('.hot-new-video').first();
        var $audio = $('.show-content a.download').first();
        
        var videoUrl = $video.attr('data-url');
        var audioUrl = $audio.attr('href');
        
        this.push({
            videoUrl : videoUrl,
            audioUrl : audioUrl
        });
        
        done(null);
    });
}
