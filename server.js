var express = require("express");
var app = express();
var mongojs = require("mongojs");
var db = mongojs("centraldogma", ["centraldogma"]);
var bodyParser = require("body-parser");
var childProcess = require("child_process");

app.use(express.static("public"));
app.use(bodyParser.json());


app.get("/getdb", function (req, res) {

    db.centraldogma.find(function (err, entries) {
    	if (err) console.error(err);
		res.send(entries);
	});
});


app.post("/convertDNA", function (req, res) {

	var script = childProcess.spawn(
     	"python3", ["./sequence.py", req.body.dna]
	);
	var output = ''
	var arr = [];
	script.stdout.on("data", function (stdout) {
		output = stdout.toString();
		arr = output.split('\n');
	});
	script.on("close", function (code) {

    	if (code === 0) {
            var results = {
                dna: req.body.dna,
                rna: arr[0],
                aa: arr[2],
                len: arr[1]
            };

            db.centraldogma.save(results);
            
        } else {
        	console.log('Error in convertDNA');
        }

        res.send(results);
    });
});


// it's not quite over 9000
app.listen(9000);
console.log('Server running on port 9000');
