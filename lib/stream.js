'use strict';

var async = require('async');
var stream = require('readable-stream');
var Readable = stream.Readable;
var Writable = stream.Writable;
var Transform = stream.Transform;

module.exports = {
    transform: transform,
    readable: readable,
    writable: writable,
    buffer: buffer,
    toString: toString,
    readArray: readArray,
    pushArray: pushArray,
    bufferArray: bufferArray,
    writeNull: writeNull,
    writeConsole: writeConsole,
    readFunction: readFunction,
    allFinished: allFinished,
    workerStream: workerStream
};

function transform(callback, flush) {
    var stream;
    
    stream =  new Transform({ objectMode: true });
    stream._transform = _transform;
    if (flush) {
        stream._flush = _flush;
    }
    return stream;
    
    function _transform(chunk, enc, done) {
        /*jshint validthis: true */
        return callback.call(this, chunk, done);
    }
    
    function _flush(done) {
        /*jshint validthis: true */
        return flush.call(this, done);
    }
}

function readable(callback) {
    var stream;
    
    stream =  new Readable({ objectMode: true });
    stream._read = _read;
    return stream;
    
    function _read() {
        /*jshint validthis: true */
        return callback.call(this);
    }
}

function writable(callback) {
    var stream;
    
    stream =  new Writable({ objectMode: true });
    stream._write = _write;
    return stream;
    
    function _write(chunk, enc, done) {
        /*jshint validthis: true */
        return callback.call(this, chunk, done);
    }
}

function buffer() {
    var chunks = [];
    return transform(function (chunk, done) {
        chunks.push(chunk);
        done();
    }, function (done) {
        this.push(Buffer.concat(chunks));
        done();
    });
}

function toString() {
    return transform(function (chunk, callback) {
        callback(null, chunk.toString());
    });
}

function readArray(array) {
    var i = 0, l = array.length;
    
    return readable(function () {
        if (i < l) {
            this.push(array[i++]);
        }
        
        if (i == l) {
            this.push(null);
        }
    });
}

function pushArray(array) {
    return transform(function (chunk, done) {
        array.push(chunk);
        done(null, chunk);
    });
}


function bufferArray() {
    var chunks = [];
    return transform(function (chunk, done) {
        chunks.push(chunk);
        done();
    }, function (done) {
        this.push(chunks);
        done();
    });
}

function writeNull() {
    return writable(function (chunk, done) {
        done();
    });
}

function writeConsole() {
    return transform(function (chunk, done) {
        console.log(chunk);
        done(null, chunk);
    });
}

function readFunction(options, func) {
    var T, t0;
    
    options = options || {};
    T = options.T || 1000;
    t0 = +new Date();
    
    return readable(function () {
        var t, dt;
        
        t = +new Date();
        dt = t - t0;
        
        if (dt > T) {
            t0 = t0 + T;
            dt = t0 - t;
        }
        
        this.push(func(dt, T));
    });
}

function allFinished(streams, callback) {
    var count = 0;
    streams.map(function (stream) {
        if ( ! stream._writableState.finished) {
            count++;
            stream.once('finish', function () {
                count--;
                finish();
            });
        } else {
            finish();
        }
    });
    
    function finish() {
        if (count === 0 && count !== null) {
            count = null;
            callback();
        }
    }
}

function workerStream(options, worker) {
    if (typeof options == 'function') {
        worker = options;
        options = {};
    }
    options.concurency = options.concurency || 4;
    
    var queue = async.queue(worker, options.concurency);
    return transform(function (chunk, done) {
        queue.push(chunk, function (error) {
            done(error, chunk);
        });
    }, function (done) {
        queue.drain = done;
    });
}
