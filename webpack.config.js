const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  entry: "./src/client/index.tsx",
  watch: true,
  output: {
    path: path.join(__dirname, "/src/public"),
    filename: "bundle.js",
    clean: true,
  },
  mode: "development",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".json", ".js", ".jsx", ".ts", ".tsx"],
  },
};
