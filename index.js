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

app.get("/joke", async (request, response) => {
  const name = request.query.name;
  var variables = {
    name: name,
    joke: await getJoke(name),
  };
  response.render("joke", variables);
});

var client;
const databaseAndCollection = {
  db: process.env.MONGO_DB_NAME,
  collection: process.env.MONGO_COLLECTION,
};

async function connectDB() {
  const userName = process.env.MONGO_DB_USERNAME;
  const password = process.env.MONGO_DB_PASSWORD;
  const mongoURI = `mongodb+srv://${userName}:${password}@cluster0.sadwkuu.mongodb.net/?retryWrites=true&w=majority`;

  client = new MongoClient(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  try {
    await client.connect();
  } catch (e) {
    console.error(e);
    client.close();
  }
}

async function getJoke(name) {
  // TODO get date
  const date = "today";

  // TODO check if joke for name and date exists
  let filter = { name: name, date: date };
  const cursor = client
    .db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);

  result = await cursor.toArray();

  // TODO if no joke exists for name and date:
  // - Get a joke from humor api.
  //	- If daily request limit is hit then reuse a joke from a random name with a joke for today
  // - save joke in db (if reusing save under additional name)

  if (result.length == 0) {
    console.log("creating joke");
    let newJoke = {
      name: name,
      date: date,
      joke: "EXJOKE",
    };
    const result = await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .insertOne(newJoke);
    return await getJoke(name);
  } else {
    return result[0].joke;
  }
}

app.listen(portNumber);
connectDB();
console.log(`Web server started and running at http://localhost:${portNumber}`);
