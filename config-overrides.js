const webpack = require("webpack");
const pkgJSON = require("./package.json");

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer"),
  };

  config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"];

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.DefinePlugin({
      "process.env.PACKAGE_VERSION": JSON.stringify(pkgJSON.version),
    }),
  ];

  return config;
};