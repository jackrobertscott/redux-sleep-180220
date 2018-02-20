'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Wrap thunk function in a helpful loading and error handling wrapper.
 */
function thunkify(_ref) {
  var _this = this;

  var start = _ref.start,
      end = _ref.end,
      error = _ref.error;

  return function (work) {
    return function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(dispatch, getState) {
        var result, problem;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                result = void 0;
                problem = void 0;

                if (start) {
                  start(dispatch, getState);
                }
                _context.prev = 3;
                _context.next = 6;
                return work(dispatch, getState);

              case 6:
                result = _context.sent;
                _context.next = 13;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context['catch'](3);

                problem = _context.t0;
                if (error) {
                  error(problem, dispatch, getState);
                }

              case 13:
                if (end) {
                  end(dispatch, getState);
                }
                return _context.abrupt('return', { error: problem, data: result });

              case 15:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this, [[3, 9]]);
      }));

      return function (_x, _x2) {
        return _ref2.apply(this, arguments);
      };
    }();
  };
}

/**
 * Check an parameter is a string or throw an error.
 */
function checkString(chars, _ref3) {
  var method = _ref3.method,
      message = _ref3.message;

  if (typeof chars !== 'string') {
    throw new Error(message || 'String parameter must be given to the ' + (method || 'unknown') + ' method.');
  }
}

module.exports = {
  thunkify: thunkify,
  checkString: checkString
};