require("babel-core/register");
require("babel-polyfill");


import express from "express"

const app = express()
var cors = require('cors');

// Middleware
app.use(express.json())

const getmedia = require("./routes/api/getmedia.js")

app.use("/api/getmedia/", getmedia);
app.use("/pastes", cors(), express.static("./paste"));

// Get Movies
app.get("/", async (req, res) => {
    res.send('Hello World');
});

const port = process.env.PORT || 5001

app.listen(port, () => console.log(`Server started on port ${port}`))