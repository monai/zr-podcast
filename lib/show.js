var request = require('request');
var cheerio = require('cheerio');
var moment  = require('moment');
var stream  = require('stream-util2');

module.exports = scrape;
function scrape(options, done) {
    request(options.url)
    .pipe(stream.buffer())
    .pipe(stream.toString())
    .pipe(parseShow())
    .pipe(stream.writable(function (show, done_) {
        done(null, show);
        done_(null);
    }));
}

function parseShow() {
    return stream.transform(function (doc, done) {
        var self = this;
        var $ = cheerio.load(doc);
        
        var $show   = $('.top-show').first();
        var $h1     = $show.find('h1').first();
        var $img    = $show.find('img').first();
        var $desc   = $show.find('.description').first();
        var $author = $show.find('.author-block').first();
        
        var title  = $h1.text().trim();
        var img    = $img.attr('src');
        var desc   = $desc.text().trim();
        var author = $author.text().trim();
        
        self.push({
            title       : title,
            author      : author,
            image       : img,
            description : desc
        });
        
        done(null);
    });
}
