/* global __DEVELOPMENT__, __DISABLE_SSR__, webpackIsomorphicTools */
/* eslint no-underscore-dangle: 0 */
/* eslint consistent-return: 0 */
import express from 'express';
import React from 'react';
import bodyParser from 'body-parser';
import { match } from 'react-router';
import createMemoryHistory from 'react-router/lib/createMemoryHistory';
import { Provider } from 'react-redux';
import path from 'path';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import createHtml from './create-html';
import createStore from './create-store';
import cookieParser from 'cookie-parser';
import AuthFetch from './auth-fetch';
import Url from 'url';
import { createWrappedComponent } from './wrapped-component';

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = process.env.DISABLE_SSR;
global.__DEVELOPMENT__ = (process.env.NODE_ENV !== 'production');

const API_HOST = process.env.API_HOST;

const clearRequireCache = () => {
  Object.keys(require.cache).forEach(k => (delete require.cache[k]));
};

export default (app, options) => {
  options = options || {};
  options.forwardCookies = options.forwardCookies || [];

  app.use(express.static(path.join(process.cwd(), 'dist')));
  app.use(bodyParser.urlencoded({extended: false}))
  app.use(bodyParser.json())
  app.use(cookieParser());

  app.use((req, res) => {
    if (__DEVELOPMENT__) {
      webpackIsomorphicTools.refresh();
      clearRequireCache();
    }

    const getRoutes = require('routes').default;

    const history = createMemoryHistory(req.originalUrl);
    const store = createStore(history);

    const authFetch = new AuthFetch(store.dispatch);
    authFetch.setApiPrefix(__DEVELOPMENT__
      ? 'http://localhost/api'
      : `${API_HOST}/api`);

    options.forwardCookies.forEach(c => {
      const cookie = req.cookies[c];
      cookie && authFetch.setCookie(c, cookie);
    });

    const renderAndSend = (component, cookies) => {
      if (cookies) {
        res.set('set-cookie', cookies[0]);
      }
      res.end(createHtml({
        assets: webpackIsomorphicTools.assets(),
        store,
        component,
      }));
    };

    if (__DISABLE_SSR__) {
      return renderAndSend();
    }

    const state = req.method !== 'GET'
      ? {method: req.method, body: req.body}
      : null;
    const location = {
      pathname: Url.parse(req.url).pathname,
      query: req.query,
      state
    };

    const matchOptions = { history, routes: getRoutes(store, authFetch), location };
    match(matchOptions, (error, redirectLocation, renderProps) => {
      if (error) {
        console.error(error); // eslint-disable-line no-console
        return renderAndSend();
      }

      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname);
      }

      if (!renderProps) {
        return res.status(404).end('Not found');
      }

      const helpers = { authFetch };
      const Wrapped = createWrappedComponent(authFetch);
      loadOnServer({ ...renderProps, store, helpers }).then(() => {
        const component = (
          <Provider store={store} key="provider">
            <Wrapped>
              <ReduxAsyncConnect {...renderProps} />
            </Wrapped>
          </Provider>
        );

        renderAndSend(component, authFetch.cookies);
      });
    });
  });

  return app;
};

process.on('SIGINT', function() {
  process.exit();
});
