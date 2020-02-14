require("babel-core/register");
require("babel-polyfill");

import express from "express"

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

const getmedia = require("./routes/api/getmedia.js")

app.use("/api/getmedia/", getmedia);
app.use("/pastes", express.static("./paste"));

// Get Movies
app.get("/", async (req, res) => {
    res.send('Hello World'); 
});

const port = process.env.PORT || 8080

app.listen(port, () => console.log(`Server started on port ${port}`))
