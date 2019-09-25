const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "./entry.js"),
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.htl$/,
        use: {
          loader: path.resolve("./index.js")
        }
      }
    ]
  }
};
