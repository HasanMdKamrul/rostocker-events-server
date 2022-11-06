// ** Imports
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

app.get("/events", async (req, res) => {
  try {
    const events = await eventCollection.find({}).toArray();

    res.send({
      success: true,
      data: events,
      message: "Event Retrived",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** Delete the event

app.delete("/events/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = {
      _id: ObjectId(id),
    };

    const { deletedCount } = await eventCollection.deleteOne(query);

    deletedCount &&
      res.send({
        success: true,
        message: "Event Deleted",
      });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** Update the event

// ** get the event findOne you want to update

app.get("/events/:id", async (req, res) => {
  try {
    const event = await eventCollection.findOne({
      _id: ObjectId(req.params.id),
    });

    event &&
      res.send({
        success: true,
        data: event,
      });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** update the event

app.patch("/events/:id", async (req, res) => {
  try {
    const filter = {
      _id: ObjectId(req.params.id),
    };

    const { name, place, time, date, fee, guestallowed, image } = req.body;

    const updatedEvent = {
      $set: {
        name,
        place,
        time,
        date,
        fee,
        guestallowed,
        image,
      },
    };

    const result = await eventCollection.updateOne(filter, updatedEvent);

    result.modifiedCount &&
      res.send({
        success: true,
        data: updatedEvent,
        message: `Event Updated`,
      });

    console.log(result);
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

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
