'use strict';

require('dotenv').config();
const log = require('./logger.js');
const config = require('../config.json');
const ipify = require('./ipify.js');
const aws = require('./aws.js')(config);



Promise.all([
	ipify(), //Get IP address
	aws.ingresRules() // get current ingres rules
])
.then(([ip, ingres]) => {
	log.info("Found IP address: %s", ip);
	console.log(ingres);
})
.catch(err => {
	log.error({err}, "Error!");
})