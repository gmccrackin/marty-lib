'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var sinon = require('sinon');
var expect = require('chai').expect;
var buildMarty = require('./buildMarty');
var autoDispatch = require('../autoDispatch');
var constants = require('../../constants/constants');
var stubbedLogger = require('../../../test/lib/stubbedLogger');
var MockDispatcher = require('../../../test/lib/mockDispatcher');
var describeStyles = require('../../../test/lib/describeStyles');

describe('ActionCreators', function () {
  var actionCreators, dispatcher, actualResult, Marty;
  var expectedActionType, expectedOtherArg, expectedArg;
  var actualAction, logger;

  beforeEach(function () {
    Marty = buildMarty();
    Marty.isASingleton = true;
    logger = stubbedLogger();
    dispatcher = new MockDispatcher();
  });

  afterEach(function () {
    logger.restore();
  });

  describe('when you pass in an application', function () {
    var application;

    beforeEach(function () {
      Marty.isASingleton = false;

      var App = (function (_Marty$Application) {
        function App() {
          _classCallCheck(this, App);

          _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this);
          this.register('creators', (function (_Marty$ActionCreators) {
            function AC() {
              _classCallCheck(this, AC);

              if (_Marty$ActionCreators != null) {
                _Marty$ActionCreators.apply(this, arguments);
              }
            }

            _inherits(AC, _Marty$ActionCreators);

            return AC;
          })(Marty.ActionCreators));
        }

        _inherits(App, _Marty$Application);

        return App;
      })(Marty.Application);

      application = new App();
    });

    afterEach(function () {
      Marty.isASingleton = true;
    });

    it('should be accessible on the object', function () {
      expect(application.creators.app).to.equal(application);
    });
  });

  describe('autoDispatch(constant)', function () {
    var TestConstants;
    beforeEach(function () {
      TestConstants = constants(['TEST_CONSTANT']);

      actionCreators = Marty.createActionCreators({
        dispatcher: dispatcher,
        testConstant: autoDispatch(TestConstants.TEST_CONSTANT)
      });
    });

    describe('when I create an action', function () {
      var expectedArguments;

      beforeEach(function () {
        expectedArguments = [1, 2, 3];
        actionCreators.testConstant.apply(actionCreators, expectedArguments);
        actualAction = dispatcher.getActionWithType('TEST_CONSTANT');
      });

      it('should dispatch an action with the constant name', function () {
        expect(actualAction).to.exist;
      });

      it('should pass through all the arguments', function () {
        expect(actualAction.arguments).to.eql(expectedArguments);
      });
    });
  });

  describe('when you create an action creator called \'dispatch\'', function () {
    it('should throw an error', function () {
      expect(createADispatchActionCreator).to['throw'](Error);

      function createADispatchActionCreator() {
        var TestConstants = constants(['DISPATCH']);

        return Marty.createActionCreators({
          dispatcher: dispatcher,
          dispatch: TestConstants.DISPATCH()
        });
      }
    });
  });

  describe('resolve', function () {
    var context, creators, actualInstance, expectedInstance, action;

    beforeEach(function () {
      action = sinon.spy();
      creators = Marty.createActionCreators({
        id: 'foo',
        displayName: 'Bar',
        someAction: action
      });

      context = Marty.createContext();
      actualInstance = creators['for'](context);
      expectedInstance = context.instances.ActionCreators.foo;
    });

    it('should resolve to the actual instance', function () {
      expect(actualInstance).to.equal(expectedInstance);
    });

    it('should still expose all actions', function () {
      creators.someAction(1);
      expect(action).to.be.calledWith(1);
    });
  });

  describe('when the action creator is created from a constant', function () {
    describe('when you pass in a function', function () {
      var TestConstants;
      beforeEach(function () {
        TestConstants = constants(['TEST_CONSTANT']);

        actionCreators = Marty.createActionCreators({
          dispatcher: dispatcher,
          testConstant: TestConstants.TEST_CONSTANT(function (a, b, c) {
            this.dispatch(a, b, c);
          })
        });
      });

      describe('when I create an action', function () {
        var expectedArguments;

        beforeEach(function () {
          expectedArguments = [1, 2, 3];
          actionCreators.testConstant.apply(actionCreators, expectedArguments);
          actualAction = dispatcher.getActionWithType('TEST_CONSTANT');
        });

        it('should dispatch an action with the constant name', function () {
          expect(actualAction).to.exist;
        });

        it('should pass through all the arguments', function () {
          expect(actualAction.arguments).to.eql(expectedArguments);
        });
      });
    });

    describe('when you dont pass in a function', function () {
      var TestConstants, expectedProperties;
      beforeEach(function () {
        expectedProperties = {
          foo: 'bar',
          baz: 'bam'
        };

        TestConstants = constants(['TEST_CONSTANT']);

        actionCreators = Marty.createActionCreators({
          dispatcher: dispatcher,
          testConstant: TestConstants.TEST_CONSTANT()
        });
      });

      describe('when I create an action', function () {
        var expectedArguments;

        beforeEach(function () {
          expectedArguments = [1, 2, 3];
          actionCreators.testConstant.apply(actionCreators, expectedArguments);
          actualAction = dispatcher.getActionWithType('TEST_CONSTANT');
        });

        it('should dispatch an action with the constant name', function () {
          expect(actualAction).to.exist;
        });

        it('should pass through all the arguments', function () {
          expect(actualAction.arguments).to.eql(expectedArguments);
        });
      });
    });
  });

  describeStyles('when I dispatch a query', function (styles) {
    beforeEach(function () {
      expectedArg = { foo: 'bar' };
      expectedOtherArg = { baz: 'bim' };
      expectedActionType = 'SOME_ACTION';
      actionCreators = styles({
        classic: function classic() {
          return Marty.createActionCreators({
            dispatcher: dispatcher,
            someAction: function someAction(arg) {
              this.dispatch(expectedActionType, expectedOtherArg, arg);
            }
          });
        },
        es6: function es6() {
          var TestActionCreators = (function (_Marty$ActionCreators2) {
            function TestActionCreators() {
              _classCallCheck(this, TestActionCreators);

              if (_Marty$ActionCreators2 != null) {
                _Marty$ActionCreators2.apply(this, arguments);
              }
            }

            _inherits(TestActionCreators, _Marty$ActionCreators2);

            _createClass(TestActionCreators, [{
              key: 'someAction',
              value: function someAction(arg) {
                this.dispatch(expectedActionType, expectedOtherArg, arg);
              }
            }]);

            return TestActionCreators;
          })(Marty.ActionCreators);

          return new TestActionCreators({
            dispatcher: dispatcher
          });
        }
      });

      actualResult = actionCreators.someAction(expectedArg);
    });

    it('should not return anything', function () {
      expect(actualResult).to.not.be.defined;
    });

    describe('#dispatch()', function () {
      beforeEach(function () {
        actualAction = dispatcher.getActionWithType(expectedActionType);
      });

      it('should dispatch the action with the given action type', function () {
        expect(actualAction).to.exist;
      });

      it('should dispatch the action with the given arguments', function () {
        expect(actualAction.arguments).to.eql([expectedOtherArg, expectedArg]);
      });
    });
  });

  describe('#mixins', function () {
    var mixin1, mixin2;

    beforeEach(function () {
      mixin1 = {
        foo: function foo() {
          return 'bar';
        }
      };

      mixin2 = {
        bar: function bar() {
          return 'baz';
        }
      };

      actionCreators = Marty.createActionCreators({
        dispatcher: dispatcher,
        mixins: [mixin1, mixin2]
      });
    });

    it('should allow you to mixin object literals', function () {
      expect(actionCreators.foo()).to.equal('bar');
      expect(actionCreators.bar()).to.equal('baz');
    });
  });
});