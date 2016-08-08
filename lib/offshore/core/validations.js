/**
 * Handles validation on a model
 *
 * Uses Offshore-validator for validating
 * https://github.com/Atlantis-Software/offshore-validator
 */

var _ = require('lodash');
var validator = require('offshore-validator');
var async = require('async');
var utils = require('../utils/helpers');
var hasOwnProperty = utils.object.hasOwnProperty;
var WLValidationError = require('../error/WLValidationError');
var offshoreCriteria = require('offshore-criteria');
var associationValidator = require('./associationValidations');
var normalize = require('../utils/normalize');

/**
 * Build up validations using the Offshore-validator module.
 *
 * @param {String} adapter
 */

var Validator = module.exports = function(context) {
  this.validations = {};
  this.associations = {};
  this.context = context;
};

/**
 * Builds a Validation Object from a normalized attributes
 * object.
 *
 * Loops through an attributes object to build a validation object
 * containing attribute name as key and a series of validations that
 * are run on each model. Skips over type and defaultsTo as they are
 * schema properties.
 *
 * Example:
 *
 * attributes: {
 *   name: {
 *     type: 'string',
 *     length: { min: 2, max: 5 }
 *   }
 *   email: {
 *     type: 'string',
 *     required: true
 *   }
 * }
 *
 * Returns: {
 *   name: { length: { min:2, max: 5 }},
 *   email: { required: true }
 * }
 */

Validator.prototype.initialize = function(attrs, types, defaults, criteria) {
  var self = this;

  defaults = defaults || {};

  // These properties are reserved and may not be used as validations
  this.reservedProperties = [
    'criteria',
    'defaultsTo',
    'primaryKey',
    'autoIncrement',
    'unique',
    'index',
    'collection',
    'dominant',
    'through',
    'columnName',
    'foreignKey',
    'references',
    'on',
    'groupKey',
    'model',
    'via',
    'size',
    'example',
    'validationMessage',
    'validations',
    'populateSettings',
    'onKey',
    'protected',
    'meta'
  ];

  if (defaults.ignoreProperties && Array.isArray(defaults.ignoreProperties)) {
    this.reservedProperties = this.reservedProperties.concat(defaults.ignoreProperties);
  }

  //this.criteria = criteria;
  this.criteria = normalize.criteria(criteria);

  this.defaults = {};

  if (criteria) {
    _.keys(this.criteria.where).forEach(function(key) {
      if (attrs[key]) {
        var type = attrs[key].type || attrs[key];
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

  // Add custom type definitions to validator
  types = types || {};
  validator.define(types);

  Object.keys(attrs).forEach(function(attr) {
    self.validations[attr] = {};

    Object.keys(attrs[attr]).forEach(function(prop) {

      // Ignore null values
      if (attrs[attr][prop] === null) { return; }

      if ((prop === 'collection') || (prop === 'model')) {
        self.associations[attr] = new associationValidator(self.context);
      }

      // If property is reserved don't do anything with it
      if (self.reservedProperties.indexOf(prop) > -1) { return; }

      // use the Offshore-validator `in` method for enums
      if (prop === 'enum') {
        self.validations[attr]['in'] = attrs[attr][prop];
        return;
      }

      self.validations[attr][prop] = attrs[attr][prop];
    });
  });
};

/**
 * Validator.prototype.validate()
 *
 * Accepts a dictionary of values and validates them against
 * the validation rules expected by this schema (`this.validations`).
 * Validation is performed using Anchor.
 *
 *
 * @param {Dictionary} values
 *        The dictionary of values to validate.
 *
 * @param {Boolean|String|String[]} presentOnly
 *        only validate present values (if `true`) or validate the
 *        specified attribute(s).
 *
 * @param {Function} callback
 *        @param {Error} err - a fatal error, if relevant.
 *        @param {Array} invalidAttributes - an array of errors
 */

Validator.prototype.validate = function(values, presentOnly, cb) {
  var self = this;
  var errors = {};
  var validations = Object.keys(this.validations);
  var associations = Object.keys(this.associations);

  // Handle optional second arg AND Use present values only, specified values, or all validations
  var type = Array.isArray(presentOnly) ? 'array' : typeof presentOnly;
  
  //affecting default values specified in the model criteria to the record to insert if they don't exist
  values = _.defaults(values, self.defaults);
  
  switch (type) {
    case 'function':
      cb = presentOnly;
      break;
    case 'string':
      validations = [presentOnly];
      break;
    case 'array':
      validations = presentOnly;
      break;
    default:
      // Any other truthy value.
      if (presentOnly) {
        validations = _.intersection(validations, Object.keys(values));
      }
  }

  // Validate all validations in parallel
  async.each(validations, function _eachValidation(validation, cb) {
    var curValidation = self.validations[validation];

    // Build Requirements
    var requirements;
    try {
      requirements = validator(curValidation);
    }
    catch (e) {
      // Handle fatal error:
      return cb(e);
    }

    // Grab value and set to null if undefined
    var value = _.isUndefined(values[validation]) ? null : values[validation];

    // If value is not required and empty then don't
    // try and validate it
    if (!curValidation.required) {
      if (value === null || value === '') {
        return cb();
      }
    }

    // If Boolean and required manually check
    if (curValidation.required && curValidation.type === 'boolean' && (typeof value !== 'undefined' && value !== null)) {
      if (value.toString() === 'true' || value.toString() === 'false') {
        return cb();
      }
    }

    // If type is integer and the value matches a mongoID let it validate
    if (hasOwnProperty(self.validations[validation], 'type') && self.validations[validation].type === 'integer') {
      if (utils.matchMongoId(value)) {
        return cb();
      }
    }

    // Rule values may be specified as sync or async functions.
    // Call them and replace the rule value with the function's result
    // before running validations.
    async.each(Object.keys(requirements.data), function _eachKey(key, next) {
      try {
        if (typeof requirements.data[key] !== 'function') {
          return next();
        }

        // Run synchronous function
        if (requirements.data[key].length < 1) {
          requirements.data[key] = requirements.data[key].apply(values, []);
          return next();
        }

        // Run async function
        requirements.data[key].call(values, function(result) {
          requirements.data[key] = result;
          next();
        });
      }
      catch (e) {
        return next(e);
      }
    }, function afterwards(unexpectedErr) {
      if (unexpectedErr) {
        // Handle fatal error
        return cb(unexpectedErr);
      }

      // If the value has a dynamic required function and it evaluates to false lets look and see
      // if the value supplied is null or undefined. If so then we don't need to check anything. This
      // prevents type errors like `undefined` should be a string.
      // if required is set to 'false', don't enforce as required rule
      if (requirements.data.hasOwnProperty('required') && !requirements.data.required) {
        if (_.isNull(value)) {
          return cb();
        }
      }

      // Now run the validations using Offshore-validator.
      var validationError;
      try {
        validationError = validator(value).to(requirements.data, values);
      }
      catch (e) {
        return cb(e);
      }

      // If no validation errors, bail.
      if (!validationError) {
        return cb();
      }

      // Build an array of errors.
      errors[validation] = [];

      validationError.forEach(function(obj) {
        if (obj.property) {
          delete obj.property;
        }
        errors[validation].push({ rule: obj.rule, message: obj.message });
      });

      return cb();
    });

  }, function allValidationsChecked(err) {
    // Handle fatal error:
    if (err) {
      return cb(err);
    }

    if (Object.keys(errors).length !== 0) {
      return cb(null, errors);
    }
    // validate criteria of the model
    if (!offshoreCriteria([values], {where: self.criteria ? self.criteria.where : void 0}).results[0]) {
      errors.Criteria = [{rule: 'criteria', message: 'Object :\n' + require('util').inspect(values) + ' does not respect criteria defined in the model.'}];
      return cb(null, errors);
    }
    // validate association's criteria
    async.each(associations, function(association, next) {
      var associationValues = values[association] || [];
      if (!_.isArray(associationValues)) {
        associationValues = [associationValues];
      }
      async.each(associationValues, function(value, next) {
        self.associations[association].validate(value, false, next);
      }, next);

    }, cb);
  });
};
