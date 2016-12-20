var Robot = require('./robot.js');
var cronJob = require("cron").CronJob;
var  spawn = require( 'child_process').spawn;

new cronJob('1 0 0 * * *', function() {
	Robot.updateArticle().then(function(){
		spawn("python",["E:/git_pro/BigData-ML/MLmain.py"],{})
	})
}, null, true, 'Asia/Shanghai');
Robot.updateArticle()