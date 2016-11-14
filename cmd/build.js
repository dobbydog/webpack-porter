const webpackBuild = require('../lib/webpack-build')
const helper = require('../lib/cmd-helper')

exports.command = 'build <target>'
exports.desc = 'Build target'
exports.builder = yargs => helper.applyCommonOptions(yargs)
exports.handler = argv => {
  let target = helper.getTarget(argv)

  webpackBuild(target)
}
