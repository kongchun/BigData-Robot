var csv = require('./csv.js');
var db = require("./db.js");


var file = "data/demo.csv";
var jsons = []
csv.reader(file).then(function(rows) {
	jsons = rows.map(function(row) {
		var [url, title, content, tags] = row;
		var abstract = "",
			similar = ""
		return {
			url,
			title,
			content,
			tags,
			abstract,
			similar
		}
	})
	return db.open("test")
}).then(function() {
	return db.insertUnique(jsons)
}).then(function() {
	return db.close()
}).then(function() {
	console.log("success");
}).catch(function(e) {
	console.log(e);
});