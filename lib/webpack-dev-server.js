const helper = require('./cmd-helper');
const WebpackDevServer = require('webpack-dev-server');

module.exports = function webpackDevServer(env, vars) {
  let compiler = helper.getWebpackCompiler({env, vars, hmr: true});

  const server = new WebpackDevServer(compiler, {
    hot: true,
    stats: {
      colors: true,
      errorDetails: true,
      chunks: true
    }
  });

  server.listen(3001, '0.0.0.0', () => {});
}
