const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
    mode: "development",

    devServer: {
        publicPath: "/",
        contentBase: "./",
        hot: true,
        watchContentBase: true,
        compress: false,
        port: 4201
    },

    watchOptions: {
        ignored: ["node_modules"],
        poll: 1000
    },

    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: "initial",
                    name: "vendor",
                    test: /node_modules|libs/,
                    enforce: true
                }
            }
        }
    },

    plugins: [
        new webpack.DefinePlugin({
            CANVAS_RENDERER: JSON.stringify(true),
            WEBGL_RENDERER: JSON.stringify(true)
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "index.html"),
            inject: "body"
        })
    ],

    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js"
    }
});
