const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
      crypto: false,
      http: false,
      https: false,
      zlib: false,
      stream: false,
      buffer: false,
  };

  return config;
};
