var Robot = require('./robot.js');
var cronJob = require("cron").CronJob;


new cronJob('1 0 0 * * *', function() {
	Robot.updateArticle()
}, null, true, 'Asia/Shanghai');
Robot.updateArticle()