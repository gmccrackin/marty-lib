'use strict';

var _ = require('../mindash');

function autoDispatch(constant) {
  return function () {
    var args = _.toArray(arguments);

    args.unshift(constant);

    this.dispatch.apply(this, args);
  };
}

module.exports = autoDispatch;