var Robot = require('./robot.js');
var UpdateArticle = require('./datayuan/update/UpdateArticle.js');
var cronJob = require("cron").CronJob;
var  spawn = require( 'child_process').spawn;

//更新datayuan的调用方�?
//UpdateArticle.getUpdateAticleList
new cronJob('1 0 0 * * *', function() {
	Robot.updateArticle().then(function(){
		UpdateArticle.getUpdateAticleList().then(function(){
			console.log("python start");
			spawn("python",["D:/bigData/BigData-ML/MLmain.py"],{});
			console.log("python end");
		})
	})
}, null, true, 'Asia/Shanghai');
Robot.updateArticle().then(function(){
		UpdateArticle.getUpdateAticleList().then(function(){
			console.log("python start");
			spawn("python",["D:/bigData/BigData-ML/MLmain.py"],{});
			console.log("python end");
		})
	})
//spawn("python",["D:/bigData/BigData-ML/MLmain.py"],{})