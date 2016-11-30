var loader = require('./loader.js');
var db = require('./db.js');
var url = "http://dataunion.org";

var dbTable = "articles"

//Step1(); //加载所有数据url
//Step2(); //加载所有文章
UpdateArticle(); //更新文章



function Step1() {
	getPageSize(url).then(function(max) {
		return loadPage(max);
	})
}


function getPageUrl(page) {
	return "http://dataunion.org/page/" + page;
}

function getPageSize(url) {
	return new Promise(function(resolve, reject) {
		loader(url).then(function($) {
			resolve($("a.page-numbers[title='最末页']").text())
		}).catch(reject)
	})
}

function getURIByPage(url) {
	console.log("load", url);
	return new Promise(function(resolve, reject) {
		loader(url).then(function($) {
			var arr = [];
			$("#main section h2 a").each(function(i, item) {
				arr.push($(item).attr("href"));
			});
			resolve(arr);
		}).catch(reject)
	})
}

function loadPage(max) {
	var arr = spiltUrl(getPageLoadUrl(max), 50); //50页写一次数据库 50*8 400条写一次数据库
	return iteratorArr(arr, function(subArr) {
		return subArrFn(subArr);
	}).then(function(list) {
		console.log("finish")
		return Promise.resolve();
	});
}

function getUrlNumber(url) {
	return parseInt(url.replace("http://dataunion.org/", "").replace(".html", ""))
}

function subArrFn(arr) {
	var list = [];
	return iteratorArr(arr, getURIByPage).then(function(t) {
		// 二维数组扁平化
		var flatten = t.reduce(function(previous, current) {
			return previous.concat(current);
		});
		/*
		list = flatten.map(i => {
			return {
				url: i,
				id: getUrlNumber(i),
				loaded: false
			}
		});
		*/
		return urlsToJSONArray(flatten);
	}).then(function(list) {
		return writerDB(list);
	}).then(function() {
		return Promise.resolve();
	})
}

function urlsToJSONArray(flatten) {
	list = flatten.map(i => {
		return {
			url: i,
			id: getUrlNumber(i),
			loaded: false
		}
	});
	return list;
}

function writerDB(list) {
	return db.open(dbTable).then(function() {
		return db.insertUnique(list);
	}).catch(function(e) {
		console.log(e)
	})
}

function iteratorArr(arr, promiseCallback) {
	var it = arr[Symbol.iterator]();
	var list = [];
	return new Promise(function(resolve, reject) {
		var x = (item) => {
			if (item.done) {
				resolve(list);
				list = [];
				return;
			}
			promiseCallback(item.value).then(function(value) {
				list.push(value)
				x(it.next())
			}).catch(reject)
		}
		x(it.next());
	})
}

function getPageLoadUrl(max) {
	var arr = [];
	for (let i = 1; i <= max; i++) {
		arr.push(getPageUrl(i));
	}
	return (arr);
}


function spiltUrl(arr, limit = 0) {
	var max = arr.length;

	if (limit == 0 || limit > max) {
		limit = max;
	}
	var stepSize = Math.ceil(max / limit);
	var list = [];
	var count = 0;
	for (let i = 0; i < stepSize; i++) {
		var arrItem = [];
		for (let j = 0; j < limit; j++) {
			if (count < max) {
				arrItem.push(arr[count++])
			}
		}
		list.push(arrItem);
	}
	return list;
}


//加载所有文章
function Step2() {
	db.open(dbTable).then(function(collection) {
		return collection.find({
			loaded: false
		}).sort({
			id: -1
		}).toArray()
	}).then(function(list) {
		return loaderArticleArr(list)
	}).then(function() {
		db.close()
		console.log("finish")
	}).catch(function(e) {
		db.close()
		console.log(e)
	})
}

function loaderArticleArr(list) {
	return iteratorArr(list, function(value) {
		return loaderArticle(value);
	}).then(function() {
		return Promise.resolve();
	})
}

function loaderArticle(json) {
	var url = json.url;
	return getArticle(url).then(function(article) {
		article.loaded = true;;
		var result = Object.assign({}, json, article);
		console.log("update " + result.url);
		//console.log(result);
		return db.collection.save(result);
	});
}

function getArticle(url) {
	return new Promise(function(resolve, reject) {
		loader(url).then(function($) {
			var article = $("article.content");
			var title = article.find(".mscctitle a").text().trim();
			var tag = [];
			article.find(".msccaddress a").each((x, y) => tag.push($(y).text()))
			var tags = (tag.join(","));
			var content = article.find(".content-text").text();
			var abstract = "",
				similar = ""
			resolve({
				url,
				title,
				tags,
				content,
				abstract,
				similar
			})

		}).catch(reject)
	})
}

//updateId();

function updateId() {
	db.open(dbTable).then(function(collection) {
		return collection.find({
			id: null
		}).toArray()
	}).then(function(list) {
		return iteratorArr(list, function(value) {
			value.id = getUrlNumber(value.url);
			return db.collection.save(value);
		}).then(function() {
			return Promise.resolve();
		})
	}).then(function() {
		db.close()
	})
}



function UpdateArticle() {
	updateURI().then(function() {
		Step2()
	})
}

function updateURI() {
	return db.open(dbTable).then(function(collection) {
		return collection.find({}).sort({
			id: -1
		}).limit(1).toArray();
	}).then(function(json) {
		var lastId = (json[0].id)
		return findUpdateURI(lastId)
	}).then(function(json) {
		var list = urlsToJSONArray(json);
		return writerDB(list);
	}).then(function() {
		return Promise.resolve();
	})
}


function findUpdateURI(lastId) {
	var list = []
	var i = 1;

	function find() {
		return getURIByPage(getPageUrl(i++)).then(function(arr) {
			return arr.filter(function(t) {
				return getUrlNumber(t) > lastId;
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

}
/*
db.open("urls").then(function(collection) {
	return collection.find({
		loaded: false
	}).sort({
		_id: 1
	}).limit(2).toArray();
}).then(function(arr) {
	return update(arr);
}).then(function(t) {
	console.log("finish")
}).catch(funct“ion(e) {
	db.close();
	console.log(e)
})

function update(arr) {
	return iteratorArr(arr, function(value) {
		return loaderArticle(value); //db.collection.save(value);
	}).then(function() {
		return Promise.resolve();
	})
}






*/