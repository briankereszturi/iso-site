#!/usr/bin/env node
'use strict';

const spawnSync = require('child_process').spawnSync;
const path = require('path');

const command = process.argv[2];

const dir = './node_modules/iso-site';
const nodePath = `${process.env.NODE_PATH || ''}:./src:./node_modules:${dir}/node_modules`;

const cfg = require(path.join(process.cwd(), 'package.json')).isoSite || {};

switch (command) {
  case "build": {
    const webpack = path.join(process.cwd(), 'node_modules/.bin/webpack')
    const args = [
      '--progress',
      '-p',
      '--config',
      `${dir}/src/webpack.prod.config.js`
    ];
    spawnSync(webpack, args, { stdio: 'inherit' });
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

