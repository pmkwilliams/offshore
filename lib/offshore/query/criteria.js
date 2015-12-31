var _ = require('lodash');

var Criteria = module.exports = {
  toString: function(criteria) {
    var self = this;
    if (_.isUndefined(criteria)) {
      return 'undefined';
    }
    if (_.isNull(criteria)) {
      return 'null';
    }
    if (_.isString(criteria)) {
      return criteria;
    }
    if (_.isNumber(criteria) || _.isDate(criteria) || _.isBoolean(criteria)) {
      return criteria.toString();
    }
    if (_.isFunction(criteria)) {
      return 'fct()';
    }
    if (_.isArray(criteria)) {
      var arr = [];
      criteria.forEach(function(crit) {
        arr.push(self.toString(crit));
      });
      return '[' + _.sortBy(arr, function(ct) { return ct; }).toString() + ']';
    }
    if (_.isObject(criteria)) {
      var keys = _.sortBy(_.keys(criteria), function(key) { return key; });
      var ret = '{';
      keys.forEach(function(key){
        ret += "'" + key + "':" + self.toString(criteria[key]) + ',';
      });
      return ret.slice(0,-1) + '}';
    }
  }
};