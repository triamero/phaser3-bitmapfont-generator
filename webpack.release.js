const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },

    output: {
        path: __dirname,
        filename: "dist/[name].[hash].js",
        chunkFilename: "dist/[name].[hash].js",
        publicPath: ""
    },

    plugins: [
        new HtmlPlugin({
            template: path.resolve(__dirname, "src", "index.html"),
            inject: "body",
        })
    ]
});
