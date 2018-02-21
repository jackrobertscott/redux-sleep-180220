import 'babel-polyfill';
import test from 'ava';
import { checkString, thunkify } from '../lib/util';

test('should error if no string passed', (t) => {
  const error = t.throws(() => checkString());
  t.is(error.message, 'String parameter must be given to the unknown method.');
});
test('should not error if string passed', t => t.notThrows(() => checkString('example')));

const setup = () => {
  const values = {
    start: false,
    end: false,
    error: false,
    work: false,
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
  });
});
