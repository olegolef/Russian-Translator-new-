const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "path": require.resolve("path-browserify"),
          "zlib": require.resolve("zlib-browserify"),
          "fs": false,
          "crypto": false,
          "stream": false,
          "util": false,
          "buffer": false,
          "url": false,
          "os": false,
          "assert": false,
          "constants": false,
          "querystring": false,
          "http": false,
          "https": false,
          "net": false,
          "tls": false,
          "child_process": false
        }
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    ]
  }
};



