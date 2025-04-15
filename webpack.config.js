const path = require('path');
const mainConfig = require('./webpack.main.config');
const rendererConfig = require('./webpack.renderer.config');

// Merge configurations correctly for electron-forge
module.exports = [
  {
    ...mainConfig,
    output: {
      path: path.join(__dirname, '.webpack'),
      filename: 'main/index.js',
      libraryTarget: 'commonjs2'
    },
    mode: 'development',
    target: 'electron-main'
  },
  {
    ...rendererConfig,
    output: {
      path: path.join(__dirname, '.webpack'),
      filename: 'renderer/index.js',
      libraryTarget: 'var',
      library: 'App'
    },
    mode: 'development',
    target: 'electron-renderer'
  }
];