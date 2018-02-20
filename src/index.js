require('babel-polyfill');
const { createAction, handleActions, combineActions } = require('redux-actions');
const { constantCase, camelCase } = require('change-case');
const { plural, singular } = require('pluralize');
const { thunkify, checkString } = require('./util');

class Resource {
  /**
   * Initialise all properties.
   */
  constructor(appName, resourceName, { state = {}, methods = [], thunks = [] } = {}) {
    if (typeof resourceName !== 'string') {
      throw new Error('Parameter "resourceName" must be given to the Resource constructor as string.');
    }
    if (typeof state !== 'object') {
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
    this.initialState = Object.assign({
      [this.arrayName]: [],
      [this.singleName]: null,
      problem: null,
      loading: false,
      success: null,
    }, state || {});
    this.methods = this.defaults.concat(methods)
      .map(this.formatMethod.bind(this))
      .reduce((map, method) => map.set(method.type, method), new Map());
    this.thunks = [].concat(thunks)
      .map(this.formatThunk.bind(this))
      .reduce((map, method) => map.set(method.name, method), new Map());
    this.thunkify = thunkify({
      start: dispatch => dispatch(this.action('loading')()),
      end: dispatch => dispatch(this.action('loading')(false)),
      error: (e, dispatch) => dispatch(this.action('errored')(e)),
    });
  }

  /**
   * Set the name of the property used to hold an array of items.
   */
  get arrayName() {
    return plural(this.resourceName);
  }

  /**
   * Set the name of the property used to hold an singular of item.
   */
  get singleName() {
    return singular(this.resourceName);
  }

  /**
   * Set the default methods of the reducer.
   */
  get defaults() {
    return [{
      type: 'reset', // set to the initial state
      handler: () => ({
        ...this.initialState,
      }),
    }, {
      type: 'loading', // update loading status
      handler: (state, { payload = true }) => ({
        ...state,
        loading: payload,
        problem: payload ? null : state.problem,
        success: payload ? null : state.success,
      }),
    }, {
      type: 'success', // update success property
      handler: (state, { payload = { status: true } }) => ({
        ...state,
        success: payload,
      }),
    }, {
      type: 'errored', // update error property
      handler: (state, { payload = null }) => ({
        ...state,
        problem: payload,
      }),
    }, {
      type: 'set', // set an array of entities
      handler: (state, { payload = [] }) => ({
        ...state,
        [this.arrayName]: payload,
      }),
    }, {
      type: 'replace', // replace an item in the entities array
      handler: (state, { payload = {} }) => ({
        ...state,
        [this.arrayName]: state[this.arrayName].map((item) => {
          if (item.id === payload.id) {
            return payload;
          }
          return item;
        }),
      }),
    }, {
      type: 'remove', // remove an item in the entities array
      handler: (state, { payload = null }) => ({
        ...state,
        [this.arrayName]: state[this.arrayName].filter(item => item.id !== payload),
      }),
    }, {
      type: 'add', // add an item to the entities array
      handler: (state, { payload = null }) => ({
        ...state,
        [this.arrayName]: [...state[this.arrayName], payload],
      }),
    }, {
      type: 'current', // set the current entity obj
      handler: (state, { payload = null }) => ({
        ...state,
        [this.singleName]: payload,
      }),
    }];
  }

  /**
   * Get the reducer.
   */
  get reducer() {
    const handlers = [...this.methods.values()]
      .reduce((accum, { type, handler }) => Object.assign(accum, {
        [type]: handler,
      }), {});
    return handleActions(handlers, this.initialState);
  }

  /**
   * Add an action and handler combination to the reducer.
   */
  formatMethod({ type, handler }) {
    if (typeof type !== 'string' && !Array.isArray(type)) {
      throw new Error('Method "type" property must be passed in as a string or array of strings.');
    }
    if (typeof handler !== 'function') {
      throw new Error('Method "handler" property must be passed in as a function.');
    }
    return {
      type: Array.isArray(type) ? combineActions(...type.map((item) => {
        if (typeof item === 'string') {
          return this.localise(item);
        }
        return item;
      })) : this.localise(type),
      handler,
    };
  }

  /**
   * Register a new thunk with the resource.
   */
  formatThunk({ name, work }) {
    if (typeof name !== 'string') {
      throw new Error('Method "name" property must be passed in as a string or array of strings.');
    }
    if (typeof work !== 'function') {
      throw new Error('Method "work" property must be passed in as a function.');
    }
    return {
      name: this.localise(name),
      work,
    };
  }

  /**
   * Localise the action to this class.
   */
  localise(type) {
    checkString(type, { method: 'localise' });
    return `${this.appName}/${this.resourceName}/${constantCase(type)}`;
  }

  /**
   * Get the action for a particular reducer handler.
   */
  action(type) {
    checkString(type, { method: 'action' });
    const action = this.localise(type);
    if (!this.methods.has(action)) {
      throw new Error(`Action "${action}" does not exist on the resource.`);
    }
    return createAction(this.methods.get(action).type);
  }

  /**
   * Get a thunk function wrapped in a loading and error handler.
   */
  thunk(name) {
    checkString(name, { method: 'thunk' });
    const thunk = this.localise(name);
    if (!this.thunks.has(thunk)) {
      throw new Error(`Thunk "${thunk}" does not exist on the resource.`);
    }
    return (...args) => this.thunkify(this.thunks.get(thunk).work(...args)(this));
  }
}

module.exports = Resource;
