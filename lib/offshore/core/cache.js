var fs = require('fs');
var path = require('path');
var os = require('os');
var _ = require('lodash');

var PATH = os.tmpdir();
var PREFIX = 'CACHE_';
var HEADER_SIZE = 20;
var DEFAULT_CACHE_TIME = 3600000;

function fullpath(key) {
  return path.join(PATH, PREFIX + key);
};

module.exports = {
  get: function(key,cb){
    var self = this;
    var headerStream = fs.createReadStream(fullpath(key), {start: 0, end: HEADER_SIZE - 1});
    var header = '';
    headerStream.on('error', function(err){
      headerStream.destroy();
      if (err.code === 'ENOENT') {
        return cb(self.errors.NO_CACHE);
      }
      cb(err);
    });
    headerStream.on('data', function(data){
      header += data.toString();
    });
    headerStream.on('end', function() {
      var time = parseInt(header);
      // if cache is valid
      if ( time >= new Date().getTime() || time === 0) {
        var content = '';
        var contentStream = fs.createReadStream(fullpath(key), {start: HEADER_SIZE});
        contentStream.on('error', function(err){
          contentStream.destroy();
          cb(err);
        });
        contentStream.on('data', function(data){
          content += data.toString();
        });
        contentStream.on('end', function() {
          var cache;
          if (content === 'UNDEFINED') {
            return cb(null);
          }
          try {
            cache = JSON.parse(content);
            cb(null,cache);
          } catch(e) {
            if (_.isUndefined(cache)) {
              cb(e);
            }
          }
        });
      } else {
        cb(self.errors.NO_CACHE);
      }
    });
  },
  set: function(key,value,time){
    var valid = 0;
    if (_.isUndefined(time)) {
      valid = new Date().getTime() + DEFAULT_CACHE_TIME;
    }
    else if (time > 0) {
      valid = new Date().getTime() + (time * 1000);
    }
    var content;
    if (_.isUndefined(value)) {
      content = 'UNDEFINED';
    } else {
      content = JSON.stringify(value);
    }
    var header = valid.toString();
    var pad = HEADER_SIZE - header.length;
    for (var i = 0; i < pad; i++) {
      header += ' ';
    }
    fs.createWriteStream(fullpath(key)).write(header + content);
  },
  errors : {
    NO_CACHE: new Error("NO_CACHE")
  }
};