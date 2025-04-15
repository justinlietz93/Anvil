const rules = require('./webpack.rules');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules: [
      ...rules,
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      // Define path aliases here if needed
      '@components': path.resolve(__dirname, 'src/components/'),
      '@services': path.resolve(__dirname, 'src/services/'),
      '@contexts': path.resolve(__dirname, 'src/contexts/'),
      '@nodes': path.resolve(__dirname, 'src/nodes/'),
      '@config': path.resolve(__dirname, 'src/config/'),
    },
    fallback: {
      // Add necessary polyfills for browser APIs if needed
      "path": require.resolve("path-browserify"),
      "fs": false,
      "crypto": false
    }
  },
};
