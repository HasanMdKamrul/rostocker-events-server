// ** Imports
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

// ** app listen
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
