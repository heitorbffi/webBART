// Note: session refers to the number of the latest therapy session attended by the user,
// and has nothing to do with the web-related session concept.
// Recall this is an app to be used by patients undergoing therapy (e.g., for anxiety,
// so that we can monitor their risk-taking proneness).

const express = require("express");
const app = express();

let fs = require("fs");

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
               "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static('public'));


app.get('/', function (req, res) {
  let fileData = fs.readFileSync("bart_data.txt", "utf8");
  let jsonData = JSON.parse(fileData);

  let request = req.query;
  let session = request.session;
  let round = request.round;

  let scores = jsonData["participant_ids"]["WINNER_BOT"][session][round][0];

  res.send(JSON.stringify(scores));
});


app.post('/', jsonParser, function (req, res) {
  if (req.body.mode == "form") {
    jsonData = postForm(req, res);
  } else {
    jsonData = postData(req);
  }

  fs.writeFile("bart_data.txt", JSON.stringify(jsonData), function(err) {
      if(err) {
        console.log(err);
        res.status(400);
        return;
      }

      res.send("success");
  });
});


function postForm(req, res) {
  const id = req.body.id;
  const session = req.body.session;

  let fileData = fs.readFileSync("bart_data.txt", "utf8");

  if (fileData == "") {
    fileData = '{"participant_ids":{}}';
  }

  let jsonData = JSON.parse(fileData);

  if (jsonData["participant_ids"].hasOwnProperty(id) === false) {
    jsonData["participant_ids"][id] = {};
  }

  if(jsonData["participant_ids"][id].hasOwnProperty(session)){
    res.status(422);
  } else {
    jsonData["participant_ids"][id][session] = {};
  }

  return jsonData;
}


function postData(req) {
  const id = req.body.id;
  const session = req.body.session;
  const round = req.body.round;
  const won = req.body.won;
  const lost = req.body.lost;

  let fileData = fs.readFileSync("bart_data.txt", "utf8");
  let jsonData = JSON.parse(fileData);

  jsonData["participant_ids"][id][session][round] = [won, lost];

  return jsonData;
}

app.listen(3000);
