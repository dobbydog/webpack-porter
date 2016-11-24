const helper = require('../lib/cmd-helper');
const webpackDevServer = require('../lib/webpack-dev-server');

exports.command = 'server <target>';
exports.desc = 'Start webpack dev server';
exports.builder = yargs => helper.applyCommonOptions(yargs);
exports.handler = argv => {
  let target = helper.getTarget(argv);

  webpackDevServer(target.env, target.vars);
};
