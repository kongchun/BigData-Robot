//process.env.DB_URL = '10.82.0.1';
var robot_dataunion = require('./robot_dataunion.js');
var cronJob = require("cron").CronJob;
var spawn = require('child_process').spawn;

new cronJob('1 0 0 * * *', function() {
	robot_dataunion.updateArticle().then(function() {
		spawn("python", ["../BigData-ML/MLmain.py"], {})
	})
}, null, true, 'Asia/Shanghai');
robot_dataunion.updateArticle();