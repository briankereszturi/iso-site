'use strict';

require('babel-register')({
  ignore: function(filePath) {
    return !!filePath.match(/node_modules(?!\/iso-site)/);
  },
  presets: [
    'babel-preset-react',
    'babel-preset-es2015',
    'babel-preset-stage-0'
  ].map(require.resolve),
  plugins: [
    'babel-plugin-transform-decorators-legacy'
  ].map(require.resolve)
});

const express = require('express');
const path = require('path');
const WebpackIsoToolsConfig = require('./webpack-isomorphic-tools-config');
const WebpackIsomorphicTools = require('webpack-isomorphic-tools');

const app = express();

const pkgConfig = require(path.join(process.cwd(), 'package.json'));
if (process.env.NODE_ENV !== 'production') {
  require('./webpack.dev').default(app, pkgConfig.isoSite);
}

global.webpackIsomorphicTools = new WebpackIsomorphicTools(WebpackIsoToolsConfig)
  .server(process.cwd(), () => {
    const PORT = process.env.PORT || 3000;

    require('./server').default(app, pkgConfig.isoSite)
      .listen(PORT, function () {
        console.log('Server listening on: ' + PORT);
      });
  });

