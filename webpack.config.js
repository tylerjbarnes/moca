let path = require('path');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');

let config = {

    // Entry & Output
    entry: './src/main.js',
    output: {
        filename: 'moca-[hash:6].js',
        path: path.resolve(__dirname, 'dist')
    },

    // Modules
    module: {
        rules: [
            // Vue Loader
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Sass
                        'scss': 'vue-style-loader!css-loader!sass-loader'
                    }
                }
            },
            // Assets
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            },
            // Ceri Icon
            {
                test: /ceri-icon\/icon/,
                enforce: "post",
                loader: "ceri-icon",
                options: {
                    icons: [
                        "fa-calendar-times-o",
                        "fa-check",
                        "fa-check-circle",
                        "fa-chevron-left",
                        "fa-chevron-right",
                        "fa-clock-o",
                        "fa-comment",
                        "fa-comments-o",
                        "fa-cube",
                        "fa-eye",
                        "fa-eye-slash",
                        "fa-flag",
                        "fa-minus",
                        "fa-paper-plane",
                        "fa-pencil",
                        "fa-plus",
                        "fa-recycle",
                        "fa-search",
                        "fa-times",
                        "fa-wordpress",
                        "ma-reply"
                    ]
                }
            }
        ]
    },

    // Plugins
    plugins: process.env.NODE_ENV === 'production' ?
        [
            new CleanWebpackPlugin(['dist']),
            new HtmlWebpackPlugin({
                filename: 'output.php',
                template: 'index.php'
            })
        ] : [
            
        ],

    // Resolvers
    resolve: {
        // Aliases
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            'styles': path.resolve(__dirname, './src/style/')
        }
    },

    // Source Maps
    devtool: process.env.NODE_ENV === 'production' ?
        '#source-map' :
        '#eval-source-map',

    // Dev Server
    devServer: {
        historyApiFallback: true,
        noInfo: true,
        headers: { "Access-Control-Allow-Origin": "*" }
    }

}

module.exports = config;
