import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';
import assign from 'object-assign';
import path from 'path';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware'; import prodCfg from './webpack.prod.config.js';
import WebpackIsoToolsConfig from './webpack-isomorphic-tools-config';
import WebpackIsomorphicToolsPlugin from 'webpack-isomorphic-tools/plugin';
import babelQuery from './babel-query';

const webpackIsoToolsPlugin = new WebpackIsomorphicToolsPlugin(WebpackIsoToolsConfig).development()

Object.assign = assign;
export default function(app) {
  const config = Object.assign(prodCfg, {
    devtool: 'eval',
    entry: [
      'react-hot-loader/patch',
      'webpack-hot-middleware/client',
      'webpack/hot/only-dev-server',
      'react-hot-loader',
      'babel-regenerator-runtime',
      path.join(__dirname, 'client')
    ],
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
          loaders: ['style-loader', 'css-loader', 'less-loader']
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
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        __CLIENT__: true,
        __SERVER__: false,
        __DEVELOPMENT__: true,
        __DEVTOOLS__: true
      }),
      new ExtractTextPlugin('styles.css'),
      webpackIsoToolsPlugin
    ],
  });

  const compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, { noInfo: true }));
  app.use(webpackHotMiddleware(compiler));
}
