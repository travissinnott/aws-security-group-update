'use strict';

const pkg = require('../package.json');
const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const formatConsole = bformat({ outputMode: 'short' });

//Initialize Bunyan
const log = bunyan.createLogger({
  name: pkg.name,
  serializers: {err: bunyan.stdSerializers.err}, // bunyan.stdSerializers,
  streams: []
});


// Log to console
log.addStream({
	name: 'console',
	stream: formatConsole,
	level: 'trace'
})


log.debug("Logger Initialized.");

module.exports = log;