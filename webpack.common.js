const path = require("path");
const webpack = require("webpack");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {

    entry: {
        app: ["./src/index.ts"]
    },

    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "dist/[name].[hash].js",
        chunkFilename: "dist/[name].[hash].js",
        publicPath: ""
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        plugins: [
            new TsconfigPathsPlugin({configFile: "tsconfig.json"})
        ]
    },

    module: {
        rules: [
            {
                test: /\.(tsx?)|(js)$/,
                exclude: /node_modules/,
                loader: "ts-loader"
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            CANVAS_RENDERER: JSON.stringify(true),
            WEBGL_RENDERER: JSON.stringify(true)
        })
    ]
};
