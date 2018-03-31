'use strict';

const log = require('./logger.js');
const AWS = require('aws-sdk');



class SgService {
	constructor(config) {
		// Create EC2 service objects
		const ec2 = {};
		Object.keys(config).forEach(r => {
			ec2[r] = new AWS.EC2({apiVersion: '2016-11-15', region: r});
		});
		this.ec2 = ec2;
		this.config = config;
	}

	ingresRules(regionGroups) {
		return Promise.all(
			Object.keys(this.config).map(r => { return new Promise((resolve, reject) => {
				this.ec2[r].describeSecurityGroups({ GroupIds: this.config[r] }, (err, data) => {
					if (err) {
						reject(new Error(err));
					} else {
						data.SecurityGroups.forEach(sg => { sg._region = r });
						resolve(data.SecurityGroups);
					}
				});
			})})
		).then(results => {
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
			
			return ingres;
		})	
	}
}
 

module.exports = function(config) {
	return new SgService(config);
}