var mongodb = require("mongodb");

var MongoClient = mongodb.MongoClient;
var url = 'mongodb://10.82.0.1:27017/dataunion';


var Page = {
	writer: function(urls) {
		return new Promise(function(resolve, reject) {
			var new_urls = urls.map(function(url) {
				return {
					url: url,
					loaded: false
				}
			})
			this.insert(new_urls).then(resolve).catch(reject);
		}.bind(this))
	},
	find: function(obj = {}) {
		return new Promise(function(resolve, reject) {
			MongoClient.connect(url).then(function(db) {
				var collection = db.collection('url');
				collection.find(obj).toArray().then(function(result) {
					resolve(result);
					db.close()
				}).catch(reject);
			}).catch(reject);
		})

	},
	insert: function(docs) {
		return new Promise(function(resolve, reject) {
			MongoClient.connect(url).then(function(db) {
				var collection = db.collection('url');
				collection.insert(docs).then(function(t) {
					resolve(t);
					db.close()
				}).catch(reject);
			}).catch(reject);
		})
	},
	updata: function(dos) {

	},
	clear: function() {
		return new Promise(function(resolve, reject) {
			MongoClient.connect(url).then(function(db) {
				var collection = db.collection('url');
				collection.remove().then(function(t) {
					resolve(t);
					db.close()
				}).catch(reject);
			}).catch(reject);
		})
	}
}


module.exports = T;



/*
Page.writer(["A", "B"]).then(function() {
	return Page.find()
}).then(function(r) {
	console.log(r);
	return Page.clear()
}).then(function(r) {
	return Page.find()
}).then(function(r) {
	console.log(r);
}).catch(function(e) {

	console.log(e);
})
*/