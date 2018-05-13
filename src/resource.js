const { createAction, handleActions, combineActions } = require('redux-actions');
const { constantCase, camelCase } = require('change-case');
const { plural, singular } = require('pluralize');
const { thunkify, expect } = require('./util');

class Resource {

  /**
   * Check that the payload of the action is okay.
   */
  static expect({ payload, handler }) {
    expect({ name: 'payload', value: payload, type: 'string', optional: true });
    expect({ name: 'handler', value: handler, type: 'function' });
    return (state, data) => {
      if (payload && data && typeof data.payload !== 'undefined') {
        if (payload === 'array') {
          if (!Array.isArray(data.payload)) {
            throw new Error(`Expected value "payload" to be of type "array" but got ${typeof data.payload}.`);
          }
        } else {
          expect({ name: 'payload', value: data.payload, type: payload, optional: true });
        }
      }
      return handler(state, data);
    };
  }

  /**
   * Initialise all properties.
   */
  constructor({
    scope,
    name,
    key,
    state = {},
    debug = false,
    hooks = {},
    capture = () => {},
  } = {}) {
    expect({ name: 'scope', value: scope, type: 'string' });
    expect({ name: 'name', value: name, type: 'string' });
    expect({ name: 'state', value: state, type: 'object' });
    expect({ name: 'debug', value: debug, type: 'boolean' });
    expect({ name: 'hooks', value: hooks, type: 'object' });
    expect({ name: 'capture', value: capture, type: 'function' });
    this.scope = camelCase(scope);
    this.name = camelCase(singular(name));
    this.debug = debug;
    this.capture = capture;
    this.key = key || '_id';
    this.initialState = Object.assign({
      [this.manyName]: [],
      [this.singleName]: null,
      problem: null,
      loading: false,
      success: null,
    }, state || {});
    this.methods = new Map([...this.defaults.entries()].map(this.formatMethod.bind(this)));
    this.thunks = new Map();
    this.thunkify = thunkify({
      start: hooks.start || (dispatch => dispatch(this.action('loading')())),
      end: hooks.end || (dispatch => dispatch(this.action('loading')(false))),
      error: hooks.error || ((e, dispatch) => dispatch(this.action('errored')(e))),
      debug: this.debug,
      capture: this.capture,
    });
  }

  /**
   * Set the name of the property used to hold an array of items.
   */
  get manyName() {
    return plural(this.name);
  }

  /**
   * Set the name of the property used to hold an singular of item.
   */
  get singleName() {
    return singular(this.name);
  }

  /**
   * Set the default methods of the reducer.
   */
  get defaults() {
    const methods = new Map();
    methods
      .set('reset', Resource.expect({
        handler: () => ({
          ...this.initialState,
        }),
      }))
      .set('clean', Resource.expect({
        handler: state => ({
          ...state,
          problem: null,
          success: null,
        }),
      }))
      .set('loading', Resource.expect({
        payload: 'boolean',
        handler: (state, { payload = true }) => ({
          ...state,
          loading: payload,
          problem: payload ? null : state.problem,
          success: payload ? null : state.success,
        }),
      }))
      .set('success', Resource.expect({
        payload: 'object',
        handler: (state, { payload = { status: true } }) => ({
          ...state,
          success: payload,
        }),
      }))
      .set('errored', Resource.expect({
        payload: 'object',
        handler: (state, { payload = null }) => ({
          ...state,
          problem: payload,
        }),
      }))
      .set('set', Resource.expect({
        payload: 'array',
        handler: (state, { payload = [] }) => ({
          ...state,
          [this.manyName]: payload,
        }),
      }))
      .set('replace', Resource.expect({
        payload: 'object',
        handler: (state, { payload = null }) => ({
          ...state,
          [this.manyName]: payload ? (state[this.manyName] || []).map((item) => {
            if (item[this.key] === payload[this.key]) {
              return payload;
            }
            return item;
          }) : state[this.manyName],
        }),
      }))
      .set('remove', Resource.expect({
        payload: 'string',
        handler: (state, { payload = null }) => ({
          ...state,
          [this.manyName]: (state[this.manyName] || []).filter(item => item[this.key] !== payload),
        }),
      }))
      .set('add', Resource.expect({
        payload: 'object',
        handler: (state, { payload = null }) => ({
          ...state,
          [this.manyName]: [...(state[this.manyName] || []), payload],
        }),
      }))
      .set('current', Resource.expect({
        payload: 'object',
        handler: (state, { payload = null }) => ({
          ...state,
          [this.singleName]: payload,
        }),
      }));
    return methods;
  }

  /**
   * Get the reducer.
   */
  get reducer() {
    const handlers = [...this.methods.entries()]
      .reduce((accum, [type, handler]) => Object.assign(accum, {
        [type]: handler,
      }), {});
    return handleActions(handlers, this.initialState);
  }

  /**
   * Add a method to the reducer.
   */
  addMethod(type, handler) {
    expect({ name: 'type', value: type, type: 'string' });
    expect({ name: 'handler', value: handler, type: 'function' });
    this.methods.set(...this.formatMethod([type, handler]));
    return this;
  }

  /**
   * Add a method to the reducer.
   */
  addThunk(name, work) {
    expect({ name: 'name', value: name, type: 'string' });
    expect({ name: 'work', value: work, type: 'function' });
    this.thunks.set(...this.formatThunk([name, work]));
    return this;
  }

  /**
   * Add an action and handler combination to the reducer.
   */
  formatMethod([type, handler]) {
    expect({ name: 'type', value: type, type: 'string' });
    expect({ name: 'handler', value: handler, type: 'function' });
    const key = Array.isArray(type) ? combineActions(...type.map((item) => {
      if (typeof item === 'string') {
        return this.localise(item);
      }
      return item;
    })) : this.localise(type);
    return [key, handler];
  }

  /**
   * Register a new thunk with the resource.
   */
  formatThunk([name, work]) {
    expect({ name: 'name', value: name, type: 'string' });
    expect({ name: 'work', value: work, type: 'function' });
    return [
      this.localise(name),
      work,
    ];
  }

  /**
   * Localise the action to this class.
   */
  localise(type) {
    expect({ name: 'type', value: type, type: 'string' });
    return `${this.scope}/${this.name}/${constantCase(type)}`;
  }

  /**
   * Get the action for a particular reducer handler.
   */
  action(type) {
    expect({ name: 'type', value: type, type: 'string' });
    const action = this.localise(type);
    if (!this.methods.has(action)) {
      throw new Error(`Action "${action}" does not exist on the resource.`);
    }
    return createAction(action);
  }

  /**
   * Get a thunk function wrapped in a loading and error handler.
   */
  thunk(name) {
    expect({ name: 'name', value: name, type: 'string' });
    const thunk = this.localise(name);
    if (!this.thunks.has(thunk)) {
      throw new Error(`Thunk "${thunk}" does not exist on the resource.`);
    }
    return (...args) => this.thunkify(this.thunks.get(thunk)(...args));
  }
}

module.exports = Resource;
