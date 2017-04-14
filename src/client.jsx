import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { Router } from 'react-router';
import { createHistory as createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { ReduxAsyncConnect } from 'redux-connect';
import createStore from './create-store';
import { AppContainer as HotReloader } from 'react-hot-loader';
import AuthFetch from './auth-fetch';

const history = createBrowserHistory();

// eslint-disable-next-line no-underscore-dangle
const store = createStore(history, window.__INITIAL_STATE__);

// This counter ensures a new router is created.
const authFetch = new AuthFetch(store.dispatch);
const helpers = { authFetch };

class Wrapped extends PureComponent {
  static childContextTypes = { authFetch: React.PropTypes.object };

  getChildContext() {
    return { authFetch };
  }

  render() {
    return this.props.children;
  }
}

let counter = 0;
const renderRoot = () => {
  counter += 1;
  const getRoutes = require('routes').default;
  render(
    <HotReloader>
      <Provider store={store}>
        <Wrapped>
          <Router
            key={counter}
            routes={getRoutes(store, authFetch)} // eslint-disable-line react/no-children-prop
            history={history}
            render={props => <ReduxAsyncConnect {...props} helpers={helpers} />}
          />
        </Wrapped>
      </Provider>
    </HotReloader>,
    document.getElementById('content'),
  );
};

renderRoot();

if (module.hot) {
  module.hot.accept('routes', renderRoot);
}
