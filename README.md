# redux-sleep

> Simple structure to redux reducers to help speed up development.

[![Build Status](https://travis-ci.org/jackrobertscott/redux-sleep.svg?branch=master)](https://travis-ci.org/jackrobertscott/redux-sleep)

Convention over configuration approach to redux reducers which face RESTful endpoints.

## Install

Get started by installing hobson (and mongoose, if you haven't already).

```sh
npm install --save redux redux-sleep
```

To use the thunk functions; you must also install redux-thunk.

```sh
npm install --save redux-thunk
```

## Usage

Create the resource.

```js
const listingResource = new Resource({
  scope: 'appName',
  name: 'listing',
  key: '_id', // id key on the items
  state: {
    person: 'fred',
    extra: 'options',
    initial: ['state'],
  },
});

// code...

export default listingResource;
```

Define custom methods.

```js
listingResource.addMethod('changePerson', (state, { payload = null }) => ({
  ...state,
  person: payload,
}))
```

Define custom thunks.

```js
listingResource.addThunk('getPeople', () => resource => async (dispatch, getState) => {
  const { token } = getState().user.auth;
  const person = await apiGetRandomPerson(token);
  dispatch(resource.action('changePerson')(person));
  return { person };
});
```

Add the reducers to the redux state.

```js
const reducers = {
  listing: listingResource.reducer,
};
```

Get the actions and thunks from the resource.

```js
const mapDispatchToProps = {
  patchListing: listingResource.action('patch'),
  getListings: listingResource.thunk('getListings'),
};
```

Use the functions!

```js
this.props.patchListing({ hello: 'there' });
```

## Initial State

Initial state which is provided.

```js
{
  [pluralName]: [], // e.g. listings: []
  [singularName]: null, // e.g. listing: null
  problem: null, // will be filled with error object
  loading: false,
  success: null,
}
```

## Methods Provided

List of the methods which the resource provides by default.

| Method          | Description      |
|-----------------|------------------|
| `reset`         | Resets the state back to the initial state. |
| `loading`       | Sets the loading state option. |
| `success`       | Sets the success state option. |
| `errored`       | Sets the errored state option, usually with object. |
| `set`           | Sets the `manyName` array e.g. `listings`. |
| `replace`       | Replaces an item in the `manyName` array. |
| `remove`        | Removes an item from the `manyName` array. |
| `add`           | Adds an item to the `manyName` array. |
| `current`       | Sets the `singleName` object, usually for editing or previewing. |

## Maintainers

- [Jack Scott](https://github.com/jackrobertscott)
