const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const portNumber = 5001;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.resolve(__dirname, "pages"));
app.set("view engine", "ejs");

app.get("/", (request, response) => {
  response.render("index");
});

app.get("/joke", (request, response) => {
  const name = request.query.name;
  var variables = {
    name: name,
    joke: getJoke(name),
  };
  response.render("joke", variables);
});

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);

function getJoke(name) {
  // TODO get date

  // TODO check if joke for name and date exists

  // TODO if no joke exists for name and date:
  // - Get a joke from humor api.
  //	- If daily request limit is hit then reuse a joke from a random name with a joke for today
  // - save joke in db (if reusing save under additional name)
  return "{JOKE}";
}
