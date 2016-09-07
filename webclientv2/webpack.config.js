var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = {

  devtool: 'cheap-module-eval-source-map',

  entry: {
    //globals: [
    //  'zone.js',
    //  'reflect-metadata'
    //],
    'polyfills': './src/polyfills.ts',
    'vendor': './src/vendor.ts',
    'app': './src/main.ts'
  },
  output: {
    path: '../public',
    filename: 'v2/[name].bundle.js',
    chunkFilename:'v2/[id].chunk.js'
  },
  module:{
    preLoaders:[
      {
        test: /.js$/,
        loader: 'string-replace-loader',
        query: {
          search: 'moduleId: module.id,',
          replace: '',
          flags: 'g'
        }
      }
    ],
    loaders:[
      {test: /\.ts$/, loader: 'ts', exclude: 'node_modules'},
      {test: /\.css$/, loader: 'style!css', exclude: 'node_modules'},
      {test: /\.json$/, loader: 'json', exclude: 'node_modules'}
    ]
  },
  resolve:{
    extensions: ['', '.js', '.ts']
  },
  plugins:[
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      sourceMap: true,
      compress: {
        drop_console: true
      },
      mangle: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills'],
    }),

    new LiveReloadPlugin({
      appendScriptTag: true
    }),

    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'v2/index.html'
    })
  ]

};