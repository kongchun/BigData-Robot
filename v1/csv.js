var ycsv = require('ya-csv');
class Csv {
	constructor(fromFile, toFile) {
		console.log("=== init csv ===");
		this.from(fromFile);
		this.to(toFile);

	}
	from(file) {
		this.fromFile = file;
		return this;
	}
	to(file) {
		this.toFile = file;
		return this;
	}

	addRow(row, callback) {
		var row = Array.from(row);
		this.addRows([row])
	}

	addRows(rows, callback) {
		//[[url,title,content,tags]]
		this.rows = Array.from(rows);
		this.callback = callback;
		this.reader();
		return this;
	}
	reader() {
		if (!this.fromFile) {
			this.writer();
			return;
		}
		var reader = ycsv.createCsvFileReader(this.fromFile);
		reader.addListener('data', function(data) {
			this.rows.push(data)
		}.bind(this));

		reader.addListener('end', function(data) {
			this.writer();
		}.bind(this));
	}
	writer() {
		this.toFile = (this.toFile) ? this.toFile : this.fromFile;
		var writer = ycsv.createCsvFileWriter(this.toFile);
		this.rows.forEach((r) => writer.writeRecord((r)));

		writer.addListener('close', function(data) {
			console.log("witer finish");
			this.callback && this.callback()
		}.bind(this));
	}
}
module.exports = Csv;


var file = "../data/demoA.csv";
var file2 = "../data/demoB.csv";
var csv = new Csv();
csv.from(file).to(file2).addRow([2, 2, 3, 4])