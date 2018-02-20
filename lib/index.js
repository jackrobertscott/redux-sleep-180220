'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('babel-polyfill');

var _require = require('redux-actions'),
    createAction = _require.createAction,
    handleActions = _require.handleActions,
    combineActions = _require.combineActions;

var _require2 = require('change-case'),
    constantCase = _require2.constantCase,
    camelCase = _require2.camelCase;

var _require3 = require('pluralize'),
    plural = _require3.plural,
    singular = _require3.singular;

var _require4 = require('./util'),
    thunkify = _require4.thunkify,
    checkString = _require4.checkString;

var Resource = function () {
  /**
   * Initialise all properties.
   */
  function Resource(appName, resourceName) {
    var _Object$assign,
        _this = this;

    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref$state = _ref.state,
        state = _ref$state === undefined ? {} : _ref$state,
        _ref$methods = _ref.methods,
        methods = _ref$methods === undefined ? [] : _ref$methods,
        _ref$thunks = _ref.thunks,
        thunks = _ref$thunks === undefined ? [] : _ref$thunks;

    _classCallCheck(this, Resource);

    if (typeof resourceName !== 'string') {
      throw new Error('Parameter "resourceName" must be given to the Resource constructor as string.');
    }
    if ((typeof state === 'undefined' ? 'undefined' : _typeof(state)) !== 'object') {
      throw new Error('Option "state" must be given to the Resource constructor as an object.');
    }
    if (!Array.isArray(thunks)) {
      throw new Error('Option "thunks" must be given to the Resource constructor as an array.');
    }
    if (!Array.isArray(methods)) {
      throw new Error('Option "methods" must be given to the Resource constructor as an array.');
    }
    this.appName = camelCase(appName);
    this.resourceName = camelCase(resourceName);
    this.initialState = Object.assign((_Object$assign = {}, _defineProperty(_Object$assign, this.arrayName, []), _defineProperty(_Object$assign, this.singleName, null), _defineProperty(_Object$assign, 'problem', null), _defineProperty(_Object$assign, 'loading', false), _defineProperty(_Object$assign, 'success', null), _Object$assign), state || {});
    this.methods = this.defaults.concat(methods).map(this.formatMethod.bind(this)).reduce(function (map, method) {
      return map.set(method.type, method);
    }, new Map());
    this.thunks = [].concat(thunks).map(this.formatThunk.bind(this)).reduce(function (map, method) {
      return map.set(method.name, method);
    }, new Map());
    this.thunkify = thunkify({
      start: function start(dispatch) {
        return dispatch(_this.action('loading')());
      },
      end: function end(dispatch) {
        return dispatch(_this.action('loading')(false));
      },
      error: function error(e, dispatch) {
        return dispatch(_this.action('errored')(e));
      }
    });
  }

  /**
   * Set the name of the property used to hold an array of items.
   */


  _createClass(Resource, [{
    key: 'formatMethod',


    /**
     * Add an action and handler combination to the reducer.
     */
    value: function formatMethod(_ref2) {
      var _this2 = this;

      var type = _ref2.type,
          handler = _ref2.handler;

      if (typeof type !== 'string' && !Array.isArray(type)) {
        throw new Error('Method "type" property must be passed in as a string or array of strings.');
      }
      if (typeof handler !== 'function') {
        throw new Error('Method "handler" property must be passed in as a function.');
      }
      return {
        type: Array.isArray(type) ? combineActions.apply(undefined, _toConsumableArray(type.map(function (item) {
          if (typeof item === 'string') {
            return _this2.localise(item);
          }
          return item;
        }))) : this.localise(type),
        handler: handler
      };
    }

    /**
     * Register a new thunk with the resource.
     */

  }, {
    key: 'formatThunk',
    value: function formatThunk(_ref3) {
      var name = _ref3.name,
          work = _ref3.work;

      if (typeof name !== 'string') {
        throw new Error('Method "name" property must be passed in as a string or array of strings.');
      }
      if (typeof work !== 'function') {
        throw new Error('Method "work" property must be passed in as a function.');
      }
      return {
        name: this.localise(name),
        work: work
      };
    }

    /**
     * Localise the action to this class.
     */

  }, {
    key: 'localise',
    value: function localise(type) {
      checkString(type, { method: 'localise' });
      return this.appName + '/' + this.resourceName + '/' + constantCase(type);
    }

    /**
     * Get the action for a particular reducer handler.
     */

  }, {
    key: 'action',
    value: function action(type) {
      checkString(type, { method: 'action' });
      var action = this.localise(type);
      if (!this.methods.has(action)) {
        throw new Error('Action "' + action + '" does not exist on the resource.');
      }
      return createAction(this.methods.get(action).type);
    }

    /**
     * Get a thunk function wrapped in a loading and error handler.
     */

  }, {
    key: 'thunk',
    value: function thunk(name) {
      var _this3 = this;

      checkString(name, { method: 'thunk' });
      var thunk = this.localise(name);
      if (!this.thunks.has(thunk)) {
        throw new Error('Thunk "' + thunk + '" does not exist on the resource.');
      }
      return function () {
        var _thunks$get;

        return _this3.thunkify((_thunks$get = _this3.thunks.get(thunk)).work.apply(_thunks$get, arguments)(_this3));
      };
    }
  }, {
    key: 'arrayName',
    get: function get() {
      return plural(this.resourceName);
    }

    /**
     * Set the name of the property used to hold an singular of item.
     */

  }, {
    key: 'singleName',
    get: function get() {
      return singular(this.resourceName);
    }

    /**
     * Set the default methods of the reducer.
     */

  }, {
    key: 'defaults',
    get: function get() {
      var _this4 = this;

      return [{
        type: 'reset', // set to the initial state
        handler: function handler() {
          return _extends({}, _this4.initialState);
        }
      }, {
        type: 'loading', // update loading status
        handler: function handler(state, _ref4) {
          var _ref4$payload = _ref4.payload,
              payload = _ref4$payload === undefined ? true : _ref4$payload;
          return _extends({}, state, {
            loading: payload,
            problem: payload ? null : state.problem,
            success: payload ? null : state.success
          });
        }
      }, {
        type: 'success', // update success property
        handler: function handler(state, _ref5) {
          var _ref5$payload = _ref5.payload,
              payload = _ref5$payload === undefined ? { status: true } : _ref5$payload;
          return _extends({}, state, {
            success: payload
          });
        }
      }, {
        type: 'errored', // update error property
        handler: function handler(state, _ref6) {
          var _ref6$payload = _ref6.payload,
              payload = _ref6$payload === undefined ? null : _ref6$payload;
          return _extends({}, state, {
            problem: payload
          });
        }
      }, {
        type: 'set', // set an array of entities
        handler: function handler(state, _ref7) {
          var _ref7$payload = _ref7.payload,
              payload = _ref7$payload === undefined ? [] : _ref7$payload;
          return _extends({}, state, _defineProperty({}, _this4.arrayName, payload));
        }
      }, {
        type: 'replace', // replace an item in the entities array
        handler: function handler(state, _ref8) {
          var _ref8$payload = _ref8.payload,
              payload = _ref8$payload === undefined ? {} : _ref8$payload;
          return _extends({}, state, _defineProperty({}, _this4.arrayName, state[_this4.arrayName].map(function (item) {
            if (item.id === payload.id) {
              return payload;
            }
            return item;
          })));
        }
      }, {
        type: 'remove', // remove an item in the entities array
        handler: function handler(state, _ref9) {
          var _ref9$payload = _ref9.payload,
              payload = _ref9$payload === undefined ? null : _ref9$payload;
          return _extends({}, state, _defineProperty({}, _this4.arrayName, state[_this4.arrayName].filter(function (item) {
            return item.id !== payload;
          })));
        }
      }, {
        type: 'add', // add an item to the entities array
        handler: function handler(state, _ref10) {
          var _ref10$payload = _ref10.payload,
              payload = _ref10$payload === undefined ? null : _ref10$payload;
          return _extends({}, state, _defineProperty({}, _this4.arrayName, [].concat(_toConsumableArray(state[_this4.arrayName]), [payload])));
        }
      }, {
        type: 'current', // set the current entity obj
        handler: function handler(state, _ref11) {
          var _ref11$payload = _ref11.payload,
              payload = _ref11$payload === undefined ? null : _ref11$payload;
          return _extends({}, state, _defineProperty({}, _this4.singleName, payload));
        }
      }];
    }

    /**
     * Get the reducer.
     */

  }, {
    key: 'reducer',
    get: function get() {
      var handlers = [].concat(_toConsumableArray(this.methods.values())).reduce(function (accum, _ref12) {
        var type = _ref12.type,
            handler = _ref12.handler;
        return Object.assign(accum, _defineProperty({}, type, handler));
      }, {});
      return handleActions(handlers, this.initialState);
    }
  }]);

  return Resource;
}();

module.exports = Resource;