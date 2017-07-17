#!/usr/bin/env node
'use strict';

const spawnSync = require('child_process').spawnSync;
const path = require('path');
const webpack = require('webpack');

const command = process.argv[2];

const dir = './node_modules/iso-site';
const nodePath = `${process.env.NODE_PATH || ''}:./src:./node_modules:${dir}/node_modules`;

const pkg = require(path.join(process.cwd(), 'package.json'));

switch (command) {
  case "build": {
    process.env.NODE_ENV = 'production';
    const prodConfigBuilder = require(path.join(__dirname, 'src', 'webpack.prod.config'));
    webpack(prodConfigBuilder(pkg.isoSite), (error, stats) => {
      if (error) {
        console.log('Webpack error:', error);
        process.exit(1);
      }

      const errors = stats.compilation.errors;
      if (errors.length) {
        stats.compilation.errors.forEach(e => console.error(e));
        console.log('Webpack returned with errors.');
        process.exit(1);
      }

      console.log('Built.');
    });
    break;
  }
  case "dev": {
    const args = [ '--harmony', dir ];
    spawnSync('node', args, {
      stdio: 'inherit',
      env: Object.assign({}, process.env, { NODE_PATH: nodePath })
    });
    break;
  }
  case "start": {
    const args = [ '--harmony', dir ];
    spawnSync('node', args, {
      stdio: 'inherit',
      env: Object.assign({}, process.env, {
        NODE_ENV: 'production',
        NODE_PATH: nodePath
      })
    });
    break;
  }
  default:
    console.log(`Unknown command: ${command}`);
    process.exit(1);
}

