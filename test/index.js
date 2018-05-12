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

exampleResource.addMethod('hello', () => ({ hello: true }));
exampleResource.addThunk('example', () => async () => {});

test('resource array name is set correctly', t => t.is(exampleResource.manyName, plural(name)));
test('resource single name is set correctly', t => t.is(exampleResource.singleName, singular(name)));
test('reducer exists', t => t.truthy(exampleResource.reducer));

test('should not throw an error when given the correct payload type', t => t.notThrows(() => Resource.expect({
  payload: 'string',
  handler: () => ({}),
})({}, { payload: 'hello' })));
test('should throw an error when given the wrong payload type', t => t.throws(() => Resource.expect({
  payload: 'boolean',
  handler: () => ({}),
})({}, { payload: 'hello' })));
test('should not throw an error when given the payload type of array', t => t.notThrows(() => Resource.expect({
  payload: 'array',
  handler: () => ({}),
})({}, { payload: [] })));
test('should throw an error when expecting payload of array but is not given', t => t.throws(() => Resource.expect({
  payload: 'array',
  handler: () => ({}),
})({}, { payload: 'hello' })));

const actions = [
  { name: 'reset' },
  { name: 'loading', right: true, wrong: 12345 },
  { name: 'success', right: { status: true }, wrong: 12345 },
  { name: 'errored', right: new Error('ahhhhh!'), wrong: 12345 },
  { name: 'set', right: [], wrong: 12345 },
  { name: 'replace', right: { id: '1234567890' }, wrong: 12345 },
  { name: 'remove', right: '1234567890', wrong: 12345 },
  { name: 'add', right: { id: '1234567890' }, wrong: 12345 },
  { name: 'current', right: { id: '1234567890' }, wrong: 12345 },
  { name: 'hello' },
];
actions.forEach((action) => {
  test(`should contain a "${action.name}" action`, t => t.notThrows(() => exampleResource.action(action.name)));
});
test('should not contain a "doesNotExist" action', t => t.throws(() => exampleResource.action('doesNotExist')));
test('should contain a "example" thunk', t => t.notThrows(() => exampleResource.thunk('example')));
test('should not contain a "doesNotExist" action', t => t.throws(() => exampleResource.thunk('doesNotExist')));
