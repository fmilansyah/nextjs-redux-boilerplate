/* eslint-disable prettier/prettier */
/* eslint-disable no-param-reassign */
require('dotenv').config()
const withPlugins = require('next-compose-plugins')
const withCSS = require('@zeit/next-css')
const withLess = require('@zeit/next-less')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin')

const { ANALYZE } = process.env

const webpackConfig = {
  webpack: (config, { defaultLoaders, dev, isServer }) => {
    if (ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      )
    }
    config.node = {
      net: 'empty',
      tls: 'empty'
    }
    config.module.rules.push({
      test: /\.less$/,
      loader: 'less-loader', // compiles Less to CSS,
      options: {
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    })
    // config.module.rules.push({
    //   test: /\.less$/,
    //   options: {
    //     javascriptEnabled: true,
    //   },
    //   use: [
    //     {
    //       loader: 'style-loader',
    //     },
    //     {
    //       loader: 'css-loader',
    //     },
    //     {
    //       loader: 'less-loader',
    //     },
    //   ],
    // })
    config.module.rules.push({
      test: /\.js$|jsx/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    })
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif|mp3|wav)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]',
        },
      },
    })
    if (dev) {
      config.module.rules.push({
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: ['/node_modules/', '/.next/', '/out/'],
        enforce: 'pre',
        options: {
          emitWarning: true,
          fix: true,
        },
      })
    }
    // Probably a better way to do this: https://github.com/nuxt-community/modules/issues/98#issuecomment-318736546
    if (defaultLoaders.babel.options.plugins === undefined) {
      defaultLoaders.babel.options.plugins = []
    }
    defaultLoaders.babel.options.plugins.push([
      'import',
      {
        libraryName: 'antd',
        style: true,
      },
    ])
    if (isServer) {
      const antStyles = /antd\/.*?\/style.*?/
      const origExternals = [...config.externals]
      config.externals = [
        // eslint-disable-next-line consistent-return
        (context, request, callback) => {
          if (request.match(antStyles)) return callback()
          if (typeof origExternals[0] === 'function') {
            origExternals[0](context, request, callback)
          } else {
            callback()
          }
        },
        ...(typeof origExternals[0] === 'function' ? [] : origExternals),
      ]

      config.module.rules.unshift({
        test: antStyles,
        use: 'null-loader',
      })
    }
    config.plugins.push(
      new FilterWarningsPlugin({
        exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
      })
    )

    return config
  },
}

// fix: prevents error when .css files are required by node
if (typeof require !== 'undefined') {
  // eslint-disable-next-line no-unused-vars
  require.extensions['.css'] = (file) => {}
}

module.exports = withPlugins(
  [
    withCSS,
    withLess,
    {
      env: {
        HOST: process.env.HOST,
        HOSTNAME: process.env.HOSTNAME,
        PORT: process.env.PORT,
        API_URL: process.env.API_URL,
        API_LOCAL_URL: process.env.API_LOCAL_URL,
        API_KEY: process.env.API_KEY,
      },
      api: {
        externalResolver: true,
      },
      optionalCatchAll: true
    }
  ],
  webpackConfig
)
