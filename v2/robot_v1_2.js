var http = require('http');
var cheerio = require('cheerio');
var csv = require('./csv.js');

var file = "data/demo.csv";
const host = "dataunion.org";
const page_url = "/page/"
var startPage = 1;
const endPage = 350;
const limit = 4;


start()

function start() {

	if (startPage > endPage) {
		return;
	}

	var nextPage = startPage + limit;
	if (nextPage > endPage) {
		nextPage = endPage;
	}

	getAllArticleURI(startPage, nextPage);
	console.log("===start===");
	startPage = nextPage + 1;
}


function getAllArticleURI(startPage, endPage) {
	var list = [];
	var i = startPage;

	(function it(i) {
		if (i > endPage) {
			var set = new Set([...list]);
			loadArticle(set);
			return;
		}
		getArticleURIListByPage(i, function(arr) {
			console.log("===load Page " + i + "===")
			list = [...list, ...arr];
			it(++i);
		});

	})(i)



}


function loadArticle(list) {
	var arr = [...list];
	var rows = [];
	var size = list.size;
	var count = 0;
	arr.forEach(function(url, i) {
		getArticle(url, function(row) {
			rows.push(row)
			count++
			if (count == size) {
				startWrite(rows);
			}
		})
	})
}


function getArticle(url, callback) {
	var path = url.replace("http://dataunion.org", "");
	loadPage(path, function($) {
		var article = $("article.content");
		var title = article.find(".mscctitle a").text().trim();
		var tag = [];
		article.find(".msccaddress a").each((x, y) => tag.push($(y).text()))
		var tags = (tag.join(","));
		var content = article.find(".content-text").text();
		callback && 　callback([url, title, content, tags])

	})
}



function getArticleURIListByPage(pageNumber, callback) {
	var url = page_url + pageNumber;
	loadPage(url, function($) {
		var arr = [];
		$("#main section h2 a").each(function(i, item) {
			arr.push($(item).attr("href"));
		});
		callback(arr);

	})

}



function loadPage(path, callback) {
	var options = {
		host: host,
		port: 80,
		path: path,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
		}
	};


	var html = ""
	http.get(options, function(res) {
		res.on('data', function(data) {
			html += data;
		});
		res.on('end', function() {
			var $ = cheerio.load(html, {
				decodeEntities: false
			});
			callback($)
		});
	}).on('error', function(e) {
		console.log(path)
		console.log(e)
	})
}


//var AAAA = 0

function startWrite(rows) {
	console.log("=== write csv ===");

	//var f = 'data/demo' + AAAA++ + '.csv';
	//fs.writeFile(f, "", "utf8");

	var csvfile = new csv(file);
	csvfile.addRows(rows, function() {
		setTimeout(() => {
			start()
		}, 10)
	});
}