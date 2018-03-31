'use strict';

const ipify = require('ipify');

module.exports = function(){
	return ipify(process.env.IPIFY || 'https://api.ipify.org');
}