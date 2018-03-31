'use strict';

require('dotenv').config();
const log = require('./logger.js');
const ipify = require('ipify');
const AWS = require('aws-sdk');
const config = require('../config.json');


// Create EC2 service objects
const ec2 = {};
Object.keys(config).forEach(r => {
	ec2[r] = new AWS.EC2({apiVersion: '2016-11-15', region: r});
});


Promise.all([
	ipify(process.env.IPIFY || 'https://api.ipify.org'),
	...Object.keys(config).map(r => { return new Promise((resolve, reject) => {
		ec2[r].describeSecurityGroups({ GroupIds: config[r] }, (err, data) => {
			if (err) {
				reject(new Error(err));
			} else {
				data.SecurityGroups.forEach(sg => { sg._region = r });
				resolve(data.SecurityGroups);
			}
		});
	})})
]).then(([ip, ...results]) => {
	log.info("Found IP address: %s", ip);

	let ingres = [];
	//results is an array, some elements may also be arrays.
	let states = results.reduce((acc, val) => acc.concat(val), []); //Flatten results[]
	states.forEach(g => {
		log.info(`Security Group: [${g.GroupId}] ${g.GroupName}`);
		//console.log(JSON.stringify(g, null, 4));

		g.IpPermissions.forEach(block => {

			block.IpRanges.forEach(range => {
				if (range.Description.match(/travis/i) /* process.env.SG_NOTE */) {
					ingres.push({
						region: g._region,
						id: g.GroupId,
						name: g.GroupName,
						proto: block.IpProtocol,
						from: block.FromPort,
						to: block.ToPort,
						ip: range.CidrIp,
						desc: range.Description
					})
				}
			})

		})
	})

	console.log(ingres);
	return ingres;
})
.then()

.catch(err => {
	log.error({err}, "Error!");
})