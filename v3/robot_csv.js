var loader = require('./loader.js');
var csv = require('./csv.js');
var url = "http://dataunion.org";

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

/*
getPageSize(url).then(function(max) {

})
*/
loadPage();


function loadPage() {
	var file = "data/urls.csv";
	var arr = spiltUrl(getPageLoadUrl(3), 2);
	iteratorArr(arr, function(subArr) {
		return new Promise(function(resolve, reject) {
			iteratorArr(subArr, getURIByPage).then(function(t) {
				// 二维数组扁平化
				var flatten = t.reduce(function(previous, current) {
					return previous.concat(current);
				});
				return flatten
			}).then(function(flatten) {
				csv.addrows(file, flatten.map(i => [i]));
				return flatten
			}).then(function() {
				resolve()
			}).catch(reject)
		})


	}).then(function(list) {
		console.log("finish")
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


/*
getURIByPage(url).then(function(arr){

})
*/

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



/*
getURIByPage(1).then(function(t) {
	console.log(t)
}).catch(function(e) {
	console.log(e)
})
*/