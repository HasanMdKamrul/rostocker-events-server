// ** Imports
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const { query } = require("express");
require("dotenv").config();
const port = process.env.PORT || 15000;
const jwt = require("jsonwebtoken");

// ** Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

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

// ** jwtVeify

const jwtVeify = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ** checking the authheader (token avaiable or not)
  !authHeader &&
    res.status(401).send({
      message: "Unauthorised access",
    });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    err &&
      res.status(401).send({
        message: "Unauthorised access",
      });

    req.decoded = decoded;

    next();
  });
};

// ** Task to do -->

// ? 1. post req -> with the payload data /jwt -> token generator implementation -> require("crypto").randomBytes(64).toString("hex") , jwt.sign(token,secret)
// ? 2. Pagination implimentation
// ** currentPage , dataPerPage -> total data count has to be send to client side **

// ** verifyJwt + email in the req.decoded **

// ** grab all the events happenning **

// ** Token generation after login **

app.post("/jwt", async (req, res) => {
  try {
    const payLoad = req.body;

    console.log(payLoad);

    const token = jwt.sign(payLoad, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    console.log(token);

    token &&
      res.send({
        success: true,
        token: { token },
        message: "Token generated",
      });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

app.get("/events", jwtVeify, async (req, res) => {
  try {
    // console.log(req.query.email);

    // ** now we will check je email dise ta verified but se onno joner data chasse

    if (req.decoded.email !== req.query.email) {
      return res.send({
        success: false,
        message: `Unauthorised access for the email ${req.query.email}`,
      });
    }

    const query = {
      email: req.query.email,
    };
    if (req.query.email) {
      const events = await eventCollection.find(query).toArray();
      const count = await eventCollection.estimatedDocumentCount();
      return res.send({
        success: true,
        data: events,
        count,
        message: "Event Retrived",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});
// ** practice all events route created
app.get("/allevents", async (req, res) => {
  try {
    const currentPage = +req.query.currentPage;
    const dataPerPage = +req.query.size;

    console.log(currentPage, dataPerPage);

    const cursor = eventCollection.find({});
    const events = await cursor
      .skip(dataPerPage * currentPage)
      .limit(dataPerPage)
      .toArray();
    const count = await eventCollection.estimatedDocumentCount();
    return res.send({
      success: true,
      data: events,
      count,
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

    const { name, place, date, fee, image, email } = req.body;

    const updatedEvent = {
      $set: {
        name,
        place,
        time,
        date,
        fee,
        guestallowed,
        image,
        email,
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
