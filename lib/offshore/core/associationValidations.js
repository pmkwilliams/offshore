var _ = require('lodash');
var offshoreCriteria = require('offshore-criteria');
var normalize = require('../utils/normalize');

var AssociationValidator = module.exports = function(context) {
  this.context = context;
};

AssociationValidator.prototype.initialize = function(collectionName, criteria) {
  var self = this;
  this.collectionName = collectionName;
  this.criteria = normalize.criteria(criteria);
  this.defaults = {};
  if (this.criteria.where) {
    _.keys(this.criteria.where).forEach(function(key) {
      var attr = self.context.offshore.collections[self.collectionName]._attributes[key];
      if (attr) {
        var type = attr.type || attr;
        var val = self.criteria.where[key];
        if (_.isPlainObject(val) && type !== 'json') {
          return;
        }
        if (_.isArray(val) && type !== 'array') {
          return;
        }
        self.defaults[key] = val;
      }
    });
  }
};

AssociationValidator.prototype.validate = function(values, presentOnly, cb) {
  var errors = {};

  values = _.defaults(values, this.defaults);

  if (!offshoreCriteria([values], this.criteria).results[0]) {
    errors.Association = [{rule: 'criteria', message: 'Associated objects :\n' + require('util').inspect(values) + ' do not respect criteria specified in the parent model.'}];
    return cb(errors);
  }
  // calling model validation after validating association criteria
  this.context.offshore.collections[this.collectionName]._validator.validate(values, presentOnly, cb);
};