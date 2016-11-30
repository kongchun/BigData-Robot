var mongodb = require("mongodb");

var MongoClient = mongodb.MongoClient;
var url = 'mongodb://10.82.0.1:27017/dataunion';
mongodb.ObjectId.toString()
class DB {
	constructor() {}
	setTable(table) {
		this.table = table;
		return this;
	}
	find(row) {
		return new Promise((resolve, reject) => {
			this._find(row).then(resolve).catch(reject)
		})
	}
	open(table = this.table) {
		this.table = table;
		return new Promise((resolve, reject) => {
			this._open().then(resolve).catch(reject)
		})
	}
	insert(rows) {
		return new Promise((resolve, reject) => {
			this._insert(rows).then((t) => {
				resolve(t);
				this._close()
			}).catch((e) => {
				reject(e)
				this._close()
			});
		})
	}
	insertUnique(rows) {
		return new Promise((resolve, reject) => {
			if (!Array.isArray(rows)) {
				rows = [rows]
			}

			let it = rows[Symbol.iterator]();
			var i = ((item) => {
				if (item.done) {
					resolve()
					return;
				}

				this._insertUnique(item.value).then(function() {
					i(it.next());
				});

			})
			i(it.next())

		})


	}
	_insert(rows) {
		if (!Array.isArray(rows)) {
			rows = [rows]
		}
		rows.map((i) => {
			i["_id"] = (new mongodb.ObjectId().toString())
		});
		return new Promise((resolve, reject) => {
			this._open().then(() => {
				return this.collection.insert(rows, {
					w: 1
				});
			}).then(resolve).catch(reject);
		})
	}
	update(key, value, o) {
		return new Promise((resolve, reject) => {
			this._update(key, value, o).then(resolve).then(() => {
				this._close()
			}).catch((e) => {
				reject(e);
				this._close()
			})
		})
	}
	_update(key, value, o = {
		w: 1,
		multi: false
	}) {
		return new Promise((resolve, reject) => {
			this._open().then(() => {
				return this.collection.update(key, value, o);
			}).then(resolve).catch(reject);
		})
	}
	_insertUnique(row) {
		return new Promise((resolve, reject) => {

			this._find(row).then((t) => {
				if (t.length == 0) {
					return this._insert(row);
				} else {
					console.log(row, "is not Unique");
					return t;
				}
			}).then(resolve).
			catch(reject)
		})
	}
	_find(row) {
		return new Promise((resolve, reject) => {
			this._open().then(() => {
				return this.collection.find(row).toArray();
			}).then(function(t) {
				resolve(t)
			}).then(() => {
				this._close()
			}).catch((e) => {
				reject(e);
				this._close()
			})
		})
	}

	_open() {
		return new Promise((resolve, reject) => {
			if (this.db && this.db != null) {
				resolve(this.collection);
				return
			}

			MongoClient.connect(url).then((db) => {
				console.log("run")
				this.db = db;
				var collection = this.collection = db.collection(this.table);
				resolve(this.collection);
			}).catch(reject);
		})

	}
	close() {
		this._close();
	}
	_close() {
		this.db && this.db.close();
		this.db = null;
		this.collection = null;
	}

}

module.exports = new DB;

/*
var rows = [{
	url: "A"
}]

var db = new DB;
var o = {
	w: 1
};
o.multi = true
db.open("url").then(function(collection) {
	collection.find({}).sort({
		_id: 1
	})

})
*/


/*
.insert([{
	url: "E"
}, {
	url: "D"
}]).then(function(t) {
	console.log(t)
}).catch(function(e) {
	console.log(e)
})
*/


/*
Page.writer(["A", "B"]).then(function() {
	return Page.find()
}).then(function(r) {
	console.log(r);
	return //Page.clear()
}).then(function(r) {
	return Page.find()
}).then(function(r) {
	console.log(r);
}).catch(function(e) {

	console.log(e);
})
*/