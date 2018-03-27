/**
 * Wrap thunk function in a helpful loading and error handling wrapper.
 */
function thunkify({ start, end, error, debug }) {
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
      if (error) {
        error(problem, dispatch, getState);
      }
      if (debug) {
        throw e;
      }
    } finally {
      if (end) {
        end(dispatch, getState);
      }
    }
    return { error: problem, data: result };
  };
}

/**
 * Check an parameter is a string or throw an error.
 */
function checkString(chars, { method, message } = {}) {
  if (typeof chars !== 'string') {
    throw new Error(message || `String parameter must be given to the ${method || 'unknown'} method.`);
  }
}

module.exports = {
  thunkify,
  checkString,
};
