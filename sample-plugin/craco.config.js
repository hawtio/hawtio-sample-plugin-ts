const { ModuleFederationPlugin } = require('webpack').container
const { hawtioBackend } = require('@hawtio/backend-middleware')
const { dependencies } = require('./package.json')

module.exports = {
  webpack: {
    plugins: {
      add: [
        new ModuleFederationPlugin({
          // The container name corresponds to 'scope' passed to HawtioPlugin
          name: 'samplePlugin',
          filename: 'remoteEntry.js',
          // The key in exposes corresponds to 'remote' passed to HawtioPlugin
          exposes: {
            './plugin': './src/sample-plugin',
          },
          shared: {
            ...dependencies,
            react: {
              singleton: true,
              requiredVersion: dependencies['react'],
            },
            'react-dom': {
              singleton: true,
              requiredVersion: dependencies['react-dom'],
            },
            'react-router-dom': {
              singleton: true,
              requiredVersion: dependencies['react-router-dom'],
            },
            '@hawtio/react': {
              singleton: true,
              requiredVersion: dependencies['@hawtio/react'],
            },
          },
        }),
      ],
    },
    configure: webpackConfig => {
      // Required for Module Federation
      webpackConfig.output.publicPath = 'auto'

      webpackConfig.module.rules.push({
        test: /\.md/,
        type: 'asset/source',
      })

      // For suppressing sourcemap warnings from dependencies
      webpackConfig.ignoreWarnings = [/Failed to parse source map/]

      // To resolve errors for @module-federation/utilities 2.x
      // https://github.com/module-federation/universe/issues/827
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          path: require.resolve('path-browserify'),
          os: require.resolve('os-browserify'),
        },
      }

      // MiniCssExtractPlugin - Ignore order as otherwise conflicting order warning is raised
      const miniCssExtractPlugin = webpackConfig.plugins.find(p => p.constructor.name === 'MiniCssExtractPlugin')
      if (miniCssExtractPlugin) {
        miniCssExtractPlugin.options.ignoreOrder = true
      }

      return webpackConfig
    },
  },
  // For plugin development
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Redirect / to /hawtio/
      devServer.app.get('/', (req, res) => res.redirect('/hawtio/'))

      const username = 'developer'
      const login = true
      const proxyEnabled = true
      const plugin = []
      const hawtconfig = {}

      // Hawtio backend API mock
      devServer.app.get('/hawtio/user', (req, res) => res.send(`"${username}"`))
      devServer.app.post('/hawtio/auth/login', (req, res) => res.send(String(login)))
      devServer.app.get('/hawtio/auth/logout', (req, res) => res.redirect('/hawtio/login'))
      devServer.app.get('/hawtio/proxy/enabled', (req, res) => res.send(String(proxyEnabled)))
      devServer.app.get('/hawtio/plugin', (req, res) => res.send(JSON.stringify(plugin)))

      // hawtconfig.json mock
      devServer.app.get('/hawtio/hawtconfig.json', (req, res) => res.send(JSON.stringify(hawtconfig)))

      middlewares.push({
        name: 'hawtio-backend',
        path: '/proxy',
        middleware: hawtioBackend({
          // Uncomment it if you want to see debug log for Hawtio backend
          logLevel: 'debug',
        }),
      })

      return middlewares
    },
  },
}
