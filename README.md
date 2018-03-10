# redux-sleep
[![Build Status](https://travis-ci.org/jackrobertscott/redux-sleep.svg?branch=master)](https://travis-ci.org/jackrobertscott/redux-sleep)

Convention over configuration approach to redux facing RESTful endpoints.

## Usage

Define custom methods.

```js
const methods = [{
  type: 'patch',
  handler: (state, { payload = {} }) => ({
    ...state,
    current: state.current.id && payload.id && state.current.id === payload.id ? { ...state.current, ...payload } : state.current,
    listings: state.listings.map(listing => listing.id === payload.id ? { ...listing, ...payload } : listing),
  }),
}];
```

Define custom thunks.

```js
const thunks = [{
  name: 'getListings',
  work: async (dispatch, getState) => {
    const { token } = getState().user.auth;
    const listings = await apiGetListings(token);
    dispatch(listingResource.action('set')(listings));
    return { listings };
  },
}];
```

Create the resource.

```js
const listingResource = new Resource('listing', { methods, thunks });

export default listingResource;
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

Good luck.
