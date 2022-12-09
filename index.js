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
  // Ignore case of name
  name = name.toUpperCase();

  // Get date
  const date = new Date().toDateString();

  // Check if joke for name and date exists
  const filter = { name: name, date: date };
  const cursor = client
    .db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);

  result = await cursor.toArray();

  if (result.length == 0) {
    // No joke exists for name and date yet
    const humorURI =
      "https://api.humorapi.com/jokes/random?api-key=" +
      process.env.HUMOR_API_KEY;

    // Get a joke from humor api
    await fetch(humorURI)
      .then((resp) => resp.json())
      .then((json) => saveJoke(name, json));

    return await getJoke(name);
  } else {
    return result[0].joke;
  }
}

async function saveJoke(name, json) {
  var newJokeStr;
  if (json.status == "failure") {
    // If daily request limit is hit then reuse a joke from a random name with a joke for today

    const filter = { date: date };
    const cursor = client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find(filter);
    const result = await cursor.toArray();

    // should have 10 random jokes to chose from
    newJokeStr = result[Math.floor(Math.random() * result.length)].joke;
  } else {
    newJokeStr = json.joke;
  }

  let newJoke = {
    name: name,
    date: date,
    joke: newJokeStr,
  };

  // save joke in db (if reusing save under second name)
  await client
    .db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .insertOne(newJoke);
}

// Used during development
async function emptyDB() {
  const result = await client
    .db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .deleteMany({});
  return result.deletedCount;
}

app.listen(portNumber);
connectDB();
console.log(`Web server started and running at http://localhost:${portNumber}`);
