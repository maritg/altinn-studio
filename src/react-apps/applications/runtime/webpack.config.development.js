const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'eval',
  entry: "./src/index.tsx",
  output: {
    filename: "runtime.js",
    // chunkFilename: '[name].bundle.js'
  },
  /* optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 5,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          }
        }
      }
    }
  }, */
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".scss"],
    alias: {
      Shared: path.resolve(__dirname, '..', 'shared', 'src'),
    },
  },
  performance: {
    hints: 'warning',
  },
  module: {
    rules: [{
      test: /\.jsx?/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
      }
    },
    {
      test: /\.html$/,
      use: [{
        loader: "html-loader",
        options: {
          minimize: true
        }
      }]
    },
    {
      test: /\.scss$/,
      use: [
        "style-loader",
        "css-loader",
        "sass-loader"
      ]
    },
    {
      test: /\.svg$/,
      use: {
        loader: "svg-inline-loader",
      }
    },
    {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          url: false
        }
      },
      {
        loader: "css-loader",
        options: {
          url: false
        }
      },
      ]
    },
    {
      test: /\.tsx?/,
      loader: "awesome-typescript-loader",
    },
    {
      enforce: "pre",
      test: /\.js$/,
      loader: "source-map-loader",
    }
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: "runtime.css",
    }),
    new CheckerPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
  },
}
