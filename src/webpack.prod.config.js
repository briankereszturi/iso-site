const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const WebpackIsoToolsConfig =  require('./webpack-isomorphic-tools-config');
const WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
const babelQuery = require('./babel-query');

const webpackIsoToolsPlugin = new WebpackIsomorphicToolsPlugin(WebpackIsoToolsConfig)

function buildConfig(pkgConfig) {
  pkgConfig = pkgConfig || {};

  const referenceLibs = (pkgConfig.dllReferenceLibs || [])
    .filter(l => !!l.js)
    .map(l =>
      new webpack.DllReferencePlugin({
        context: '.',
        manifest: require(path.join(process.cwd(), 'manifests', `${l.name}-manifest.json`))
      }));

  let plugins = [ new ExtractTextPlugin('styles.css') ];

  plugins = plugins.concat(referenceLibs);

  plugins = plugins.concat([
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: false,
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    webpackIsoToolsPlugin
  ]);

  const config = {
    entry: [
      'babel-regenerator-runtime',
      path.join(__dirname, 'client')
    ],
    resolve: {
      modules: [
        path.resolve(__dirname, '..', 'node_modules'),
        path.join(process.cwd(), 'node_modules'),
        path.join(process.cwd(), 'src')
      ],
      extensions: ['.js', '.jsx']
    },
    resolveLoader: {
      modules: [
        path.resolve(__dirname, '..', 'node_modules'),
        path.join(process.cwd(), 'node_modules'),
      ]
    },
    output: {
      path: path.join(process.cwd(), 'dist'),
      filename: 'main.[hash].js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.(jpg|jpeg|png|woff|woff2|ttf|eot|svg)$/,
          loaders: ['url-loader']
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules(?!\/iso-site)/,
          use: [
            {
              loader: 'babel-loader',
              query: babelQuery
            }
          ]
        },
        {
          test: /\.less$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader!less-loader'
          })
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader'
          })
        }
      ]
    },
    plugins: plugins
  };

  return config;
}

module.exports = buildConfig;
