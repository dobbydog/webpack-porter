const helper = require('./cmd-helper');
const WebpackDevServer = require('webpack-dev-server');

module.exports = function webpackDevServer(env, vars) {
  let compiler = helper.getWebpackCompiler({env, vars, hmr: true});
  let options = compiler.options.devServer;

  if (!options.hot) options.hot = true;

  options.stats = {
    colors: true,
    errorDetails: true,
    chunks: true
  };

  const server = new WebpackDevServer(compiler, options);

  server.listen(options.port, options.host, () => {});
}
