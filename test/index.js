import test from 'ava';
import { plural, singular } from 'pluralize';
import { Resource } from '../lib/index';

test('resource exists', t => t.truthy(Resource));

const scope = 'app';
const name = 'example';

const exampleResource = new Resource({
  scope,
  name,
  state: { hello: false },
});

exampleResource.addMethod('hello', () => ({
  hello: true,
}));

test('resource array name is set correctly', t => t.is(exampleResource.manyName, plural(name)));
test('resource single name is set correctly', t => t.is(exampleResource.singleName, singular(name)));
test('reducer exists', t => t.truthy(exampleResource.reducer));

const actions = [
  'reset',
  'loading',
  'success',
  'errored',
  'set',
  'replace',
  'remove',
  'add',
  'current',
  'hello',
];
actions.forEach((action) => {
  test(`should contain a "${action}" action`, t => t.notThrows(exampleResource.action(action)));
});
test('should not contain a "doesNotExist" action', t => t.throws(() => exampleResource.action('doesNotExist')));
