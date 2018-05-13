import 'babel-polyfill';
import test from 'ava';
import { expect, thunkify } from '../lib/util';

test('should error if no string passed', (t) => {
  const error = t.throws(() => expect({ name: 'example', value: null, type: 'string' }));
  t.is(error.message, 'Expected value "example" to be of type string but got object.');
});
test('should not error if string passed', t => t.notThrows(() => expect({ name: 'example', value: 'hello', type: 'string' })));

const setup = () => {
  const values = {
    start: false,
    end: false,
    error: false,
    work: false,
    capture: false,
  };
  const thunk = thunkify({
    start: () => {
      values.start = true;
    },
    end: () => {
      values.end = true;
    },
    error: () => {
      values.error = true;
    },
    capture: () => {
      values.capture = true;
    },
  });
  return { values, thunk };
};

test('should update the states when exectuing work', (t) => {
  const { values, thunk } = setup();
  const attempt = thunk(async () => {
    values.work = true;
  });
  return attempt().then(() => {
    t.true(values.start);
    t.true(values.end);
    t.false(values.error);
    t.true(values.work);
    t.false(values.capture);
  });
});

test('should error when a error occurs in work', (t) => {
  const { values, thunk } = setup();
  const attempt = thunk(async () => {
    throw new Error('ahhh, it broke...');
  });
  return attempt().then(() => {
    t.true(values.start);
    t.true(values.end);
    t.true(values.error);
    t.false(values.work);
    t.true(values.capture);
  });
});
