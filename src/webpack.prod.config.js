const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const WebpackIsoToolsConfig =  require('./webpack-isomorphic-tools-config');
const WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
const babelQuery = require('./babel-query');

const webpackIsoToolsPlugin = new WebpackIsomorphicToolsPlugin(WebpackIsoToolsConfig)

module.exports = {
  entry: [
    'babel-regenerator-runtime',
    path.join(__dirname, 'client')
  ],
  resolve: {
    modules: [
      path.join(process.cwd(), 'node_modules'),
      path.join(process.cwd(), 'src'),
      path.resolve(__dirname, '..', 'node_modules')
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
  plugins: [
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
    new ExtractTextPlugin('styles.css'),
    webpackIsoToolsPlugin
  ]
};
