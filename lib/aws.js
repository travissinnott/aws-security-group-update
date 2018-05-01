'use strict';

const log = require('./logger.js');
const AWS = require('aws-sdk');
const moment = require('moment');

const NOTE_REGEX = new RegExp(process.env.SG_NOTE_REGEX || 'MY-RMT-ACCESS', 'i');

class SgService {
	constructor(config) {
		// Create EC2 service objects
		const ec2 = {};
		const regions = Object.keys(config);

		regions.forEach(r => {
			ec2[r] = new AWS.EC2({apiVersion: '2016-11-15', region: r});
		});
		this.ec2 = ec2;
		this.config = config;

		log.trace({NOTE_REGEX: NOTE_REGEX.toString(), regions}, 'SgService Initialized')
	}


	ingresRules(regex = NOTE_REGEX) {
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
				log.trace({regex:regex.toString()}, `Loaded [${g._region}][${g.GroupId}]: ${g.GroupName}`);
				console.log(JSON.stringify(g, null, 4));

				g.IpPermissions.forEach(block => {
					block.IpRanges.forEach(range => {
						//Note: range.Description can be undefined
						if (range.Description && range.Description.match(regex) ) {
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


	revoke(rules) {
		return Promise.all(rules.map(r => {
			return new Promise((resolve, reject) => {
				this.ec2[r.region].revokeSecurityGroupIngress({
					GroupId: r.id,
					IpPermissions: [{
						IpProtocol: r.proto,
						FromPort: r.from,
						ToPort: r.to,
						IpRanges: [{
							CidrIp: r.ip,
							Description: r.desc
						}]
					}]
				}, function(err, data) {
					if (err) reject(new Error(err));
					else resolve(data);
				})
			})
		}))
		.then(results => {
			console.log(results);
			return rules;
		})
	}

	authorize(rules) {
		return Promise.all(rules.map(r => {
			return new Promise((resolve, reject) => {
				this.ec2[r.region].authorizeSecurityGroupIngress({
					GroupId: r.id,
					IpPermissions: [{
						IpProtocol: r.proto,
						FromPort: r.from,
						ToPort: r.to,
						IpRanges: [{
							CidrIp: r.ip,
							Description: r.desc
						}]
					}]
				}, function(err, data) {
					if (err) reject(new Error(err));
					else resolve(data);
				})
			})
		}))
		.then(results => {
			log.debug(results);
			return rules;
		})
	}


	update(rules, ip) {
		// Select only invalid/old rules
		let expired = rules.filter(r => !r.ip.startsWith(ip));

		return Promise.all([
			this.revoke(expired),
			this.authorize(expired.map(r => {
				return Object.assign({}, r, {ip}) //Clone and overwrite with new IP
			}))
		])
	}

}
 

module.exports = function(config) {
	return new SgService(config);
}