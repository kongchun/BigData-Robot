var loader = require('./loader.js');
var cheerio = require('cheerio');
var db = require('./db.js');
var url = "http://dataunion.org";
var Helper = require("./helper.js")

var dbTable = "articles"; //数据库



var Page = {
	loadAll: function() {

		return this.getPageSize(url).then((maxSize) => {
			return Helper.arrayToMatrix(this.pageUrlRageArr(1, maxSize), 50)
		}).then((matrixArr) => {
			return Helper.iteratorArr(matrixArr, (arr) => {
				return this.getArticleUrlsByPageUrls(arr).then((arr) => {
					return this.writerDB(arr);
				})
			})
		}).then(function(list) {
			console.log("finish")
		}).catch(function(e) {
			console.log(e)
		})
	},
	getArticleUrlsByPageUrls: function(arr) {
		return Helper.iteratorArr(arr, this.getURIByPage).then((matrixArr) => {
			var arr = matrixArr.reduce(function(previous, current) {
				return previous.concat(current);
			})
			return this.urlsToJSONArray(arr);
		})
	},
	pageUrlRageArr: function(start = 1, max) {
		var arr = [];
		for (let i = 1; i <= max; i++) {
			arr.push(this.getPageUrl(i));
		}
		return (arr);
	},
	getPageUrl: function(page) {
		return "http://dataunion.org/page/" + page;
	},
	getPageSize: function(url) {
		return loader(url).then(function($) {
			var max = ($("a.page-numbers[title='最末页']").text());
			return Promise.resolve(max);
		});
	},
	getURIByPage: function(url) {
		console.log("load", url);
		return loader(url).then(function($) {
			var arr = [];
			$("#main section h2 a").each(function(i, item) {
				arr.push($(item).attr("href"));
			});
			return Promise.resolve(arr);
		}).catch(Promise.reject)

	},
	getUrlNumber: function(url) {
		return parseInt(url.replace("http://dataunion.org/", "").replace(".html", ""))
	},
	urlsToJSONArray: function(flatten) {
		var self = this;
		var list = flatten.map(i => {
			return {
				url: i,
				id: self.getUrlNumber(i),
				loaded: false
			}
		});
		return list;
	},

	writerDB: function(list) {
		return db.open(dbTable).then(function() {
			return db.insertUnique(list, "url");
		}).catch(function(e) {
			console.log(e)
		})
	}
}

//Page.loadAll();

var Article = {
	load: function() {
		db.open(dbTable).then(function(collection) {
			return collection.find({
				loaded: false
			}).sort({
				id: -1
			}).toArray()
		}).then((list) => {
			return this.loaderArticles(list)
		}).then(function() {
			console.log("finish")
		}).catch(function(e) {
			console.log(e)
		})
	},
	loaderArticles: function(list) {
		return Helper.iteratorArr(list, (value) => {

			return this.loaderArticle(value);
		}).then(function() {
			return Promise.resolve();
		})
	},
	loaderArticle: function(json) {
		var url = json.url;
		return this.getArticle(url).then(function(article) {
			article.loaded = true;;
			var result = Object.assign({}, json, article);

			console.log("update " + result.url);
			return db.collection.save(result);
		});
	},

	getArticle: function(url) {
		return loader(url).then(function($) {
			var article = $("article.content");
			var title = article.find(".mscctitle a").text().trim();
			var tag = [];
			article.find(".msccaddress a").each((x, y) => tag.push($(y).text()))
			var tags = (tag.join(","));
			var contentText = article.find(".content-text");
			var content = contentText.text().replace(/[\r\n ]/ig, "");
			var html = contentText.html().replace(/[\r\n]/ig, "");
			var thumbnail = ($(".content-text img").attr("src"));
			thumbnail = (thumbnail ? thumbnail : "");
			var isNew = true;
			var createDate = new Date();
			var abstract = "",
				similar = "",
				hits = 0
			return Promise.resolve({
				url,
				title,
				tags,
				content,
				abstract,
				similar,
				html,
				thumbnail,
				isNew,
				createDate,
				hits
			})
		})
	},

	updateId: function() {
		db.open(dbTable).then(function(collection) {
			return collection.find({
				id: null
			}).toArray()
		}).then(function(list) {
			return Helper.iteratorArr(list, function(value) {
				value.id = Page.getUrlNumber(value.url);
				return db.collection.save(value);
			}).then(function() {
				return Promise.resolve();
			})
		}).then(function() {
			db.close()
		})
	},
	loadUpdateURI: function() {
		return db.open(dbTable).then(function(collection) {
			return collection.find({}).sort({
				id: -1
			}).limit(1).toArray();
		}).then((json) => {
			var lastId = (json[0].id)
			return this.findUpdateURI(lastId)
		}).then((json) => {
			var list = Page.urlsToJSONArray(json);
			return Page.writerDB(list);
		}).then(function() {
			return Promise.resolve();
		})
	},

	findUpdateURI: function(lastId) {
		var list = []
		var i = 1;

		function find() {
			return Page.getURIByPage(Page.getPageUrl(i++)).then(function(arr) {
				return arr.filter(function(t) {
					return Page.getUrlNumber(t) > lastId;
				})
			}).then(function(arr) {
				if (arr.length == 0) {
					return Promise.resolve(list);
				}
				list = [...arr, ...list];
				return find()
			})
		}

		return find();

	},

	loadUpdateNew: function() {
		return db.open(dbTable).then(function(collection) {
			collection.updateMany({
				isNew: true
			}, {
				$set: {
					isNew: false
				}
			})
		})
	}

}

//Article.load();

var Robot = {
	loadArticle: function() {
		Page.loadAll().then(function() {
			return Article.load()
		}).catch(function(e) {
			console.log(e);
		})
	},
	updateArticle: function() {
		Article.loadUpdateNew().then(function() {
			return Article.loadUpdateURI()
		}).then(function() {
			return Article.load()
		}).catch(function(e) {
			console.log(e);
		})
	}
}


module.exports = Robot;
//Robot.updateArticle();
//Robot.updateArticle()
//setInterval(Robot.updateArticle, 24 * 60 * 60 * 1000);
/*
var url = "http://dataunion.org/26126.html";
run()
*/
function runUpdateHTML() {
	db.open(dbTable).then(function(collection) {
		return collection.find({
			html: null
		}).sort({
			id: -1
		}).limit(1).toArray()
	}).then(function(arr) {
		if (arr.length == 0) {
			console.log("==finish==")
			throw db.close()
		}
		var json = arr[0];
		return (json);
	}).then(function(json) {

		var url = json.url;
		return loader(url).then(function($) {
			var article = $("article.content");

			var contentText = article.find(".content-text");
			var content = contentText.text().replace(/[\r\n ]/ig, "");
			var html = contentText.html().replace(/[\r\n]/ig, "");


			return {
				content,
				html
			}
		}).then(function({
			content,
			html
		}) {
			console.log("html update:", url)

			return db.collection.update({
				'url': url
			}, {
				$set: {
					'content': content,
					'html': html
				}
			})

		}).then(function() {
			runUpdateHTML()
		})



	}).catch(function(e) {
		console.log(e)
	})
}

//runUpdateImg();

function runUpdateImg() {
	db.open(dbTable).then(function(collection) {
		return collection.find({
			thumbnail: null
		}).sort({
			id: -1
		}).limit(1).toArray()
	}).then(function(arr) {
		if (arr.length == 0) {
			console.log("==finish==")
			throw db.close()
		}
		var json = arr[0];

		return (json);
	}).then(function(json) {
		var $ = cheerio.load(json.html);
		var thumbnail = ($("img").attr("src"));
		thumbnail = (thumbnail ? thumbnail : "");
		console.log(thumbnail)
		console.log("img update:", json.url)
		return db.collection.update({
				'id': json.id
			}, {
				$set: {
					'thumbnail': thumbnail,
				}
			})
			//db.close();
	}).then(function() {
		runUpdateImg()
	}).catch(function(e) {
		console.log(e);
		db.close();
	})
}