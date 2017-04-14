#!/usr/bin/env node
'use strict';

const spawnSync = require('child_process').spawnSync;
const path = require('path');
const fs = require('fs');

const command = process.argv[2];

const dir = './node_modules/iso-site';
const nodePath = `${process.env.NODE_PATH || ''}:./src:./node_modules:${dir}/node_modules`;

const cfg = require(path.join(process.cwd(), 'package.json')).isoSite || {};

const addDockerfile = () => {
  spawnSync('cp', [
    path.resolve(__dirname, 'Dockerfile'),
    path.resolve(process.cwd(), 'Dockerfile')
  ]);
}

const removeDockerfile = (dest) => {
  spawnSync('rm', [ path.resolve(process.cwd(), 'Dockerfile') ]);
}

const cleanup = () => {
  removeDockerFile();
  process.exit(1);
}

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

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
  case "docker-build": {
    if (!cfg.dockerTag) {
      console.log('Error: dockerTag must be specified in isoSite config.');
      process.exit(1);
    }

    try {
      addDockerfile();

      const args = [ 'build', '-t', cfg.dockerTag, '.' ];
      spawnSync('docker', args, { stdio: 'inherit' });
    } finally {
      removeDockerfile()
    }
    break;
  }
  default:
    console.log(`Unknown command: ${command}`);
    process.exit(1);
}

