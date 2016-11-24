#!/usr/bin/env node

require('yargs')
.commandDir('cmd')
.demand(1)
.strict()
.help()
.argv;
