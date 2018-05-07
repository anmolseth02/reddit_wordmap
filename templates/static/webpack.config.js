const path = require('path');

module.exports = {
    entry: __dirname + '/js/components/Main.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js',
        publicPath: '/',
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
            options: {
                presets: ['react', 'es2015']
            }
        },  {
            test: /\.css$/,
            use: [
                {
                    loader: 'style-loader',
                },
                {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        importLoaders: 2,
                        sourceMap: true,
                        localIdentName: '[name]__[local]___[hash:base64:5]',
                    }
                }
            ],
        }, {
            test: /\.(png|jpg|gif)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: 'images/[name].[ext]',
                }
            }]
        }, {
            test: /\.(eot|otf|svg|ttf|woff|woff2)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[ext]',
                }
            }]
        }],
    },
};
