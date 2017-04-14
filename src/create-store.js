/* global __DEVELOPMENT__, __CLIENT__, __DEVTOOLS__ */
import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { combineReducers } from 'redux-immutable';
import { syncHistory, routeReducer } from 'react-router-redux';
import * as reducers from 'reducers';
import thunk from 'redux-thunk'
import {
  setToImmutableStateFunc,
  setToMutableStateFunc,
  immutableReducer as reduxAsyncConnect
} from 'redux-connect';
import { fromJS, Map } from 'immutable';

setToImmutableStateFunc((mutableState) => fromJS(mutableState));
setToMutableStateFunc((immutableState) => immutableState.toJS());

// TODO: Wire up devtools.
export default function createStore(history, data) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = syncHistory(history);

  const middleware = [thunk, reduxRouterMiddleware];

  let finalCreateStore;
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');
    // const DevTools = require('../containers/DevTools/DevTools');
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      // window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
    )(_createStore);
  } else {
    finalCreateStore = applyMiddleware(...middleware)(_createStore);
  }

  const reducer = combineReducers({reduxAsyncConnect, ...reducers});

  const initialState = fromJS(data);

  const store = finalCreateStore(reducer, initialState);

  // reduxRouterMiddleware.listenForReplays(store);

  return store;
}
