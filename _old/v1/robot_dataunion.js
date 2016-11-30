var loader = require("./loader.js");
var csv = require('./csv.js');
var step = 49;
var lastPage = null;
var startPage = 1;

getURI(1)

function getURI() {

	var i = startPage;
	var endPage = startPage + step;

	console.log(startPage)

	if (lastPage != null && startPage > lastPage) {
		console.log("finish")
		return;
	}

	if (lastPage != null && endPage > lastPage) {
		endPage = lastPage;
	}

	var list = [];
	(function re(i) {
		if (i > endPage) {
			var set = new Set([...list]);
			loadArticle(set);
			startPage = i;
			console.log("startPage" + startPage)
			return;
		}
		getArticleURIListByPage(i, function(arr) {
			console.log("===load Page " + i + "===");
			list = [...list, ...arr];
			re(++i);
		})
	})(startPage)
}

function getArticleURIListByPage(page, callback) {
	var page_path = `http://dataunion.org/page/${page}`;
	loader(page_path, function(res, $) {
		if (res.success) {
			var arr = [];
			$ = res.data;
			$("#main section h2 a").each(function(i, item) {
				arr.push($(item).attr("href"));

			});

			if (lastPage == null) {
				lastPage = ($("a.page-numbers[title='最末页']").text())
			}

			callback(arr);
		} else {
			console.log($)
			callback([]);
		}
	})

}


function loadArticle(list) {
	var arr = [...list];
	var rows = [];
	var it = arr[Symbol.iterator]();


	(function re() {
		var item = it.next();
		if (item.done) {

			startWrite(rows);
			return;
		}

		var url = item.value;
		getArticle(url, function(row) {
			console.log("rows" + rows.length);
			rows.push(row);
			re(it)
		})

	})(it)



}

function getArticle(url, callback) {
	loader(url, function(res) {
		if (res.success) {
			var $ = res.data;
			var article = $("article.content");
			var title = article.find(".mscctitle a").text().trim();
			var tag = [];
			article.find(".msccaddress a").each((x, y) => tag.push($(y).text()))
			var tags = (tag.join(","));
			var content = article.find(".content-text").text();
			callback && 　callback([url, title, content, tags])
		} else {
			callback && 　callback(["", "", "", ""])
		}
	})
}
var csv = new csv();
var wCount = 0;

function startWrite(rows) {
	console.log("=== write csv ===");

	var file = `./data/demo${wCount++}.csv`;
	csv.to(file).addRows(rows, function() {
		getURI()
	})
}