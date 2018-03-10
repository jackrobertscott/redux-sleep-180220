'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
  function Resource() {
    var _Object$assign,
        _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        scope = _ref.scope,
        name = _ref.name,
        _ref$state = _ref.state,
        state = _ref$state === undefined ? {} : _ref$state;

    _classCallCheck(this, Resource);

    if (typeof scope !== 'string') {
      throw new Error('Parameter "package" must be given to the Resource constructor as string.');
    }
    if (typeof name !== 'string') {
      throw new Error('Parameter "name" must be given to the Resource constructor as string.');
    }
    if ((typeof state === 'undefined' ? 'undefined' : _typeof(state)) !== 'object') {
      throw new Error('Option "state" must be given to the Resource constructor as an object.');
    }
    this.scope = camelCase(scope);
    this.name = camelCase(singular(name));
    this.initialState = Object.assign((_Object$assign = {}, _defineProperty(_Object$assign, this.manyName, []), _defineProperty(_Object$assign, this.singleName, null), _defineProperty(_Object$assign, 'problem', null), _defineProperty(_Object$assign, 'loading', false), _defineProperty(_Object$assign, 'success', null), _Object$assign), state || {});
    this.methods = new Map([].concat(_toConsumableArray(this.defaults.entries())).map(this.formatMethod.bind(this)));
    this.thunks = new Map();
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
    key: 'addMethod',


    /**
     * Add a method to the reducer.
     */
    value: function addMethod(type, handler) {
      var _methods;

      checkString(type, { method: 'addMethod' });
      if (typeof handler !== 'function') {
        throw new Error('Parameter "handler" must be of type function for Resource.addMethod method.');
      }
      (_methods = this.methods).set.apply(_methods, _toConsumableArray(this.formatMethod([type, handler])));
      return this;
    }

    /**
     * Add a method to the reducer.
     */

  }, {
    key: 'addThunk',
    value: function addThunk(name, work) {
      var _thunks;

      checkString(name, { method: 'addThunk' });
      if (typeof work !== 'function') {
        throw new Error('Parameter "work" must be of type function for Resource.addThunk method.');
      }
      (_thunks = this.thunks).set.apply(_thunks, _toConsumableArray(this.formatThunk([name, work])));
      return this;
    }

    /**
     * Add an action and handler combination to the reducer.
     */

  }, {
    key: 'formatMethod',
    value: function formatMethod(_ref2) {
      var _this2 = this;

      var _ref3 = _slicedToArray(_ref2, 2),
          type = _ref3[0],
          handler = _ref3[1];

      if (typeof type !== 'string') {
        throw new Error('Method "type" property must be passed in as a string or array of strings.');
      }
      if (typeof handler !== 'function') {
        throw new Error('Method "handler" property must be passed in as a function.');
      }
      var key = Array.isArray(type) ? combineActions.apply(undefined, _toConsumableArray(type.map(function (item) {
        if (typeof item === 'string') {
          return _this2.localise(item);
        }
        return item;
      }))) : this.localise(type);
      return [key, handler];
    }

    /**
     * Register a new thunk with the resource.
     */

  }, {
    key: 'formatThunk',
    value: function formatThunk(_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
          name = _ref5[0],
          work = _ref5[1];

      if (typeof name !== 'string') {
        throw new Error('Method "name" property must be passed in as a string or array of strings.');
      }
      if (typeof work !== 'function') {
        throw new Error('Method "work" property must be passed in as a function.');
      }
      return [this.localise(name), work.bind(this)];
    }

    /**
     * Localise the action to this class.
     */

  }, {
    key: 'localise',
    value: function localise(type) {
      checkString(type, { method: 'localise' });
      return this.scope + '/' + this.name + '/' + constantCase(type);
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
      return createAction(action);
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
    key: 'manyName',
    get: function get() {
      return plural(this.name);
    }

    /**
     * Set the name of the property used to hold an singular of item.
     */

  }, {
    key: 'singleName',
    get: function get() {
      return singular(this.name);
    }

    /**
     * Set the default methods of the reducer.
     */

  }, {
    key: 'defaults',
    get: function get() {
      var _this4 = this;

      var methods = new Map();
      methods.set('reset', function () {
        return _extends({}, _this4.initialState);
      }).set('loading', function (state, _ref6) {
        var _ref6$payload = _ref6.payload,
            payload = _ref6$payload === undefined ? true : _ref6$payload;
        return _extends({}, state, {
          loading: payload,
          problem: payload ? null : state.problem,
          success: payload ? null : state.success
        });
      }).set('success', function (state, _ref7) {
        var _ref7$payload = _ref7.payload,
            payload = _ref7$payload === undefined ? { status: true } : _ref7$payload;
        return _extends({}, state, {
          success: payload
        });
      }).set('errored', function (state, _ref8) {
        var _ref8$payload = _ref8.payload,
            payload = _ref8$payload === undefined ? null : _ref8$payload;
        return _extends({}, state, {
          problem: payload
        });
      }).set('set', function (state, _ref9) {
        var _ref9$payload = _ref9.payload,
            payload = _ref9$payload === undefined ? [] : _ref9$payload;
        return _extends({}, state, _defineProperty({}, _this4.manyName, payload));
      }).set('replace', function (state, _ref10) {
        var _ref10$payload = _ref10.payload,
            payload = _ref10$payload === undefined ? {} : _ref10$payload;
        return _extends({}, state, _defineProperty({}, _this4.manyName, state[_this4.manyName].map(function (item) {
          if (item.id === payload.id) {
            return payload;
          }
          return item;
        })));
      }).set('remove', function (state, _ref11) {
        var _ref11$payload = _ref11.payload,
            payload = _ref11$payload === undefined ? null : _ref11$payload;
        return _extends({}, state, _defineProperty({}, _this4.manyName, state[_this4.manyName].filter(function (item) {
          return item.id !== payload;
        })));
      }).set('add', function (state, _ref12) {
        var _ref12$payload = _ref12.payload,
            payload = _ref12$payload === undefined ? null : _ref12$payload;
        return _extends({}, state, _defineProperty({}, _this4.manyName, [].concat(_toConsumableArray(state[_this4.manyName]), [payload])));
      }).set('current', function (state, _ref13) {
        var _ref13$payload = _ref13.payload,
            payload = _ref13$payload === undefined ? null : _ref13$payload;
        return _extends({}, state, _defineProperty({}, _this4.singleName, payload));
      });
      return methods;
    }

    /**
     * Get the reducer.
     */

  }, {
    key: 'reducer',
    get: function get() {
      var handlers = [].concat(_toConsumableArray(this.methods.entries())).reduce(function (accum, _ref14) {
        var _ref15 = _slicedToArray(_ref14, 2),
            type = _ref15[0],
            handler = _ref15[1];

        return Object.assign(accum, _defineProperty({}, type, handler));
      }, {});
      return handleActions(handlers, this.initialState);
    }
  }]);

  return Resource;
}();

module.exports = Resource;