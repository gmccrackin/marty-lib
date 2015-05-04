'use strict';

var expect = require('chai').expect;
var buildMarty = require('./buildMarty');
var _ = require('../../mindash');

describe('context', function () {
  var Marty;

  beforeEach(function () {
    Marty = buildMarty();
    Marty.isASingleton = true;
  });

  describe('#fetch(callback)', function () {
    describe('when stores make requests to fetch data', function () {
      var Store1, Store2, fetches, diagnostics, timeout;

      beforeEach(function () {
        timeout = 50;
        fetches = {
          foo: {
            expectedTime: 10,
            expectedState: { foo: 'bar' }
          },
          bar: {
            expectedTime: 30,
            expectedError: new Error()
          },
          baz: {}
        };

        Store1 = Marty.createStore({
          id: 'Store1',
          foo: fetchFunc('foo'),
          bar: fetchFunc('bar')
        });

        Store2 = Marty.createStore({
          id: 'Store2',
          baz: fetchFunc('baz')
        });

        var context = Marty.createContext();
        var fetchState = function fetchState() {
          Store1['for'](context).foo();
          Store1['for'](context).bar();
          Store2['for'](context).baz();
        };

        return context.fetch(fetchState, { timeout: timeout }).then(function (res) {
          return diagnostics = res;
        });
      });

      it('should return diagnostics about the fetches', function () {
        // Cannot reliably test time so just going to ignore
        var diagnosticsWithoutTime = _.map(diagnostics, function (diagnostic) {
          return _.omit(diagnostic, 'time');
        });

        expect(diagnosticsWithoutTime).to.eql([{
          fetchId: 'foo',
          storeId: 'Store1',
          status: 'DONE',
          result: fetches.foo.expectedState
        }, {
          fetchId: 'bar',
          storeId: 'Store1',
          status: 'FAILED',
          error: fetches.bar.expectedError
        }, {
          fetchId: 'baz',
          storeId: 'Store2',
          status: 'PENDING'
        }]);
      });

      function fetchFunc(id) {
        return function () {
          var options = fetches[id];

          return this.fetch({
            id: id,
            locally: function locally() {
              return options.localState;
            },
            remotely: function remotely() {
              return new Promise(function (resolve, reject) {
                if (options.expectedState) {
                  options.localState = options.expectedState;

                  setTimeout(resolve, options.expectedTime);
                } else if (options.expectedError) {
                  setTimeout(function () {
                    return reject(options.expectedError);
                  }, options.expectedTime);
                }
              });
            }
          });
        };
      }
    });
  });
});