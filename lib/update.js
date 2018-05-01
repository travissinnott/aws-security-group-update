'use strict';

require('dotenv').config();
const log = require('./logger.js');
const config = require('../config.json');
const ipify = require('./ipify.js');
const aws = require('./aws.js')(config);


Promise.all([
	ipify(), //Get IP address
	aws.ingresRules() // get current ingress rules
])
.then(([ip, rules]) => {
	ip = `${ip}/32`; //Add netmask

	log.info("Your IP address: %s", ip);
	console.log(rules);


	return aws.update(rules, ip); //Update rules where IP address doesn't match ip
})
.catch(err => {
	log.error({err}, "Error!");
})