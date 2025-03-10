const webpack = require('webpack');
const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const packageJson = require('./package.json');

// input dir
const SRC_DIR = path.resolve(__dirname, './src');
// output dir
const BUILD_DIR = path.resolve(__dirname, './dist');

const mode = 'development';

const isDevMode = mode !== 'production';
const peerDependencies = new Set(Object.keys(packageJson.peerDependencies));

const output = {
  path: BUILD_DIR,
  publicPath: '/static/assets/', // necessary for lazy-loaded chunks
};
if (isDevMode) {
  output.filename = '[name].entry.js';
  output.chunkFilename = '[name].chunk.js';
} else {
  output.filename = '[name].[chunkhash].entry.js';
  output.chunkFilename = '[name].[chunkhash].chunk.js';
}

const config = {
  entry: {
    main: 'src/entry.ts',
  },
  output: {
    path: BUILD_DIR,
    publicPath: '/dist/',
    libraryTarget: 'umd',
  },
  resolve: {
    alias: {
      src: SRC_DIR,
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    symlinks: false,
  },
  module: {
    // node config is depricated
    // --colors depricated too
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 2,
            }
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              // disable gzip compression for cache files
              // faster when there are millions of small files
              cacheCompression: false,
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ], // Ensures ECMAScript 2020 support
              plugins: ['@emotion', '@babel/plugin-syntax-numeric-separator']
            },
          },
          {
            loader: 'ts-loader',
            options: {
              // transpile only in happyPack mode
              // type checking is done via fork-ts-checker-webpack-plugin
              happyPackMode: true,
              transpileOnly: true,
              // must override compiler options here, even though we have set
              // the same options in `tsconfig.json`, because they may still
              // be overriden by `tsconfig.json` in node_modules subdirectories.
              compilerOptions: {
                esModuleInterop: false,
                importHelpers: false,
                module: 'ES6',
                target: 'ES6',
              },
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/, // smth wrong with date-fns
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Ensures compatibility with older environments
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpg|gif|png)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              // using file-loader would be nice, but there's no good plan
              // to get superset to load files from the correct domain.
              // Once we figure that out, this could be set to a reasonable limit.
              limit: Infinity,
            },
          },
        ],
      },
    ],
  },
  optimization: { // we need everything in one file
    minimize: true, // minify bundle
    splitChunks: {
      chunks: 'async',
      minSize: Infinity, // set high minSize
    },
    concatenateModules: true, // improve execution time by reducing function wrappers
    runtimeChunk: false // Avoid creating a separate chunk for the Webpack runtime
  },
  plugins: [
    new CleanWebpackPlugin({
      dry: false,
    }),
    new webpack.DefinePlugin({
      'process.env.PACKAGE_NAME': JSON.stringify(packageJson.name),
    }),
  ],
  externals: [
    // define externals based on the peerDependencies in package.json
    // if we can figure out how to get a plugin to access externals via a means
    // other than global variables, let's do that.
    function externalizePeerDependencies(context, request, callback) {
      if (peerDependencies.has(request)) {
        // superset attaches shared modules to the window, prepended with "__superset__/"
        return callback(null, `__superset__/${request}`);
      }
      return callback();
    },
  ],
  // TODO make source maps work
  // devtool: isDevMode ? 'eval-source-map' : false,
  // Disable source maps to minify bundle size
  devtool: false,
};

module.exports = config;