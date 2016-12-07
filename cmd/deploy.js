const sftpDeploy = require('sftp-deploy');
const webpackBuild = require('../lib/webpack-build');
const helper = require('../lib/cmd-helper');

exports.command = 'deploy <target>';
exports.desc = 'Deploy target';
exports.builder = yargs => {
  helper.applyCommonOptions(yargs);

  yargs.options('dry-run', {
    default: false,
    desc: 'Shows the planned task for each file. No changes will be made to the remote files.'
  });

  yargs.options('skip-build', {
    default: false,
    desc: 'Disables build process before deploy.'
  });

  return yargs;
};
exports.handler = argv => {
  let target = helper.getTarget(argv);
  let options = {
    dryRun: argv.dryRun
  };

  if (!argv.skipBuild) {
    webpackBuild(target.env, target.vars).then(() => sftpDeploy(target.deploy, options));
  } else {
    sftpDeploy(target.deploy, options);
  }
};
