// ** Imports
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 15000;

// ** Middleware
app.use(cors());
app.use(express.json());

// ** test api endpoint

app.get("/", (req, res) => res.send(`Rostocker events server running`));

// ** DB CONNECTION

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ikallh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// ** DB & Collections

const eventCollection = client.db("rostockEvents").collection("events");

const run = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.log(error.message);
  }
};

// ** Api end points
// ** Creating an event
app.post("/events", async (req, res) => {
  try {
    const event = req.body;

    // ** Insert the event in our db

    const result = await eventCollection.insertOne(event);

    result.insertedId &&
      res.send({
        success: true,
        message: "Event Added",
      });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});
// ** grab all the events happenning

// ** app listen
app.listen(port, () => {
  client.connect((err) => {
    if (err) {
      console.log("DB Error Happened");
    }
    console.log("DB Connected");
  });
  console.log(`Server is running on port: ${port}`);
});
