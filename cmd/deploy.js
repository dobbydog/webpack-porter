const SftpSync = require('../lib/sftp-sync')
const webpackBuild = require('../lib/webpack-build')
const helper = require('../lib/cmd-helper')

exports.command = 'deploy <target>'
exports.desc = 'Deploy target'
exports.builder = yargs => {
  helper.applyCommonOptions(yargs)

  yargs.options('dry-run', {
    default: false,
    desc: 'Shows the planned task for each file. No changes will be made to the remote files.'
  })

  yargs.options('no-build', {
    default: false,
    desc: 'Disables build process before deploy.'
  })

  return yargs
}
exports.handler = argv => {
  let target = helper.getTarget(argv)
  let options = {
    dryRun: argv.dryRun
  }

  let sync = new SftpSync(target.deploy, options)

  if (!argv.noBuild) {
    webpackBuild(target)
  }
  sync.start()
}
