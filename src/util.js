/**
 * Wrap thunk function in a helpful loading and error handling wrapper.
 */
module.exports.thunkify = function thunkify({ start, end, error, debug, capture }) {
  return work => async (dispatch, getState) => {
    let result;
    let problem;
    if (start) {
      start(dispatch, getState);
    }
    try {
      result = await work(dispatch, getState);
    } catch (e) {
      problem = e;
      if (capture) {
        capture(e);
      }
      if (error) {
        error(problem, dispatch, getState);
      }
      if (debug) {
        console.error(e);
      }
    } finally {
      if (end) {
        end(dispatch, getState);
      }
    }
    return { error: problem, data: result || {} };
  };
};

/**
 * Make sure everything is of the correct type.
 */
module.exports.expect = function expect({ name, value, type = 'string', optional = false } = {}) {
  if (optional && typeof value === 'undefined') {
    return;
  }
  if (typeof name !== 'string') {
    throw new Error(`Expected value "name" to be of type string but got ${typeof name}.`);
  }
  if (typeof value !== type) {
    throw new Error(`Expected value "${name}" to be of type ${type} but got ${typeof value}.`);
  }
};
