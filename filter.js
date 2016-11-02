var db = require('./db.js');

var dbTable = "articles"; //数据库


db.close();
/*
fitler({
	title: /Edge Case/
}, "Edge Case");
*/

/*
fitler({
	content: /^.{1,100}$/
}, "min");

function fitler(keyObj, res) {
	db.open(dbTable).then(function(collection) {
		return collection.find(keyObj).toArray()
	}).then(function(arr) {
		arr.forEach(function(item) {
			item.delete = true;
			item.regular = res;
			db.collection.save(item);
		})
	}).catch(function(e) {
		console.log(e)
	})
}
*/
db.open(dbTable).then(function(collection) {
		return collection.find({
			delete: null
		}).toArray()
	}).then(function(arr) {



	}).then(function(arr) {

		db.close()
			/*
			arr.forEach(function(item) {
				item.delete = true;
				item.regular = res;
				db.collection.save(item);
			})
			*/

	}).catch(function(e) {
		console.log(e)
	})
	/*
	db.open(dbTable).then(function(collection) {
		return collection.find({
			title: /Post Format/
		}).toArray()
	}).then(function(arr) {
		arr.forEach(function(item) {
			item.delete = true;
			item.regular = "Post Format"
			db.collection.save(item);
		})
	}).catch(function(e) {
		console.log(e)
	})


	db.open(dbTable).then(function(collection) {
		return collection.find({
			tags: "专家团队"
		}).toArray()
	}).then(function(arr) {
		arr.forEach(function(item) {
			item.delete = true;
			item.regular = "专家团队"
			db.collection.save(item);
		})
	}).catch(function(e) {
		console.log(e)
	})

	*/