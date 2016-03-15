var fs = require('fs');
var path = require('path');
var os = require('os');
var _ = require('lodash');

var filepath = os.tmpdir();
var prefix = 'CACHE_';
var defaultCacheTime = 3600000;

var HEADER_SIZE = 20;

function fullpath(key) {
  return path.join(filepath, prefix + key);
}
;

var DefaultAdapter = {
  get: function(key, cb) {
    var self = this;
    var headerStream = fs.createReadStream(fullpath(key), {start: 0, end: HEADER_SIZE - 1});
    var header = '';
    headerStream.on('error', function(err) {
      headerStream.destroy();
      if (err.code === 'ENOENT') {
        return cb(self.errors.NO_CACHE);
      }
      cb(err);
    });
    headerStream.on('data', function(data) {
      header += data.toString();
    });
    headerStream.on('end', function() {
      var time = parseInt(header);
      // if cache is valid
      if (time >= new Date().getTime() || time === 0) {
        var content = '';
        var contentStream = fs.createReadStream(fullpath(key), {start: HEADER_SIZE});
        contentStream.on('error', function(err) {
          contentStream.destroy();
          cb(err);
        });
        contentStream.on('data', function(data) {
          content += data.toString();
        });
        contentStream.on('end', function() {
          var cache;
          if (content === 'UNDEFINED') {
            return cb(null);
          }
          try {
            cache = JSON.parse(content);
            cb(null, cache);
          } catch (e) {
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
  set: function(key, value, time) {
    var valid = 0;
    if (_.isUndefined(time)) {
      valid = new Date().getTime() + defaultCacheTime;
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
    for (var i = 0; i < pad; i ++) {
      header += ' ';
    }
    fs.createWriteStream(fullpath(key)).write(header + content);
  }
};

module.exports = {
  initialize: function(options, cb) {
    var options = options || {};
    var self = this;
    options.defaultCacheTime = options.defaultCacheTime || defaultCacheTime;

    // if an adapter is specified
    if (options.adapter && options.adapter !== 'default') {
      // Detects if there is a `getDatastore` in the adapter. Exit if it not exists.
      if (! options.adapter.getDatastore) {
        throw new Error('Adapter does not support Datastore interface which is required for cache');
      }
      options.adapter.getDatastore(options, function(err, cache) {
        self.get = function(key, cb) {
          cache.get(key, function(err, value) {
            if (err && err.message === '404') {
              cb(self.errors.NO_CACHE);
            } else if (err) {
              cb(err);
            } else if (value.ttl >= new Date().getTime() || value.ttl === 0) {
              cb(null, value.data);
            } else {
              cb(self.errors.NO_CACHE);
            }
          });
        };
        self.set = function(key, value, time) {
          var valid = 0;
          if (_.isUndefined(time)) {
            valid = new Date().getTime() + defaultCacheTime;
          } else if (time > 0) {
            valid = new Date().getTime() + (time * 1000);
          }
          var data = {ttl: valid, data: value};
          cache.set(key, data, function() {
            if (time > 0) {
              setTimeout(function() {
                //check cache
                cache.get(key, function(err, value) {
                  if (err) {
                    return;
                  }
                  if (value.ttl >= new Date().getTime()) {
                    cache.remove(key, function() {});
                  }
                });
              }, time);
            }
          });
        };
        cb();
      });
    } else {
      filepath = options.path || filepath;
      prefix = options.prefix || prefix;
      defaultCacheTime = options.defaultCacheTime;
      this.get = DefaultAdapter.get;
      this.set = DefaultAdapter.set;
      cb();
    }
  },
  errors: {
    NO_CACHE: new Error("NO_CACHE")
  }
};
