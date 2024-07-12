
const path = require('path');
const distPath = path.resolve(__dirname, 'app');

module.exports = {
    mode: "development",

    entry: './src/index.ts',
    output: {
        path: distPath,
        filename: "index.js"
    },
    devtool: "source-map",
    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: { loader: "ts-loader" }
            }
        ]
    },
    devServer: {
        static: distPath,
        compress: true,
        port: 9000,
        hot: true
    }
}