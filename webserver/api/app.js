const express = require("express");
const path = require('path');


const app = express()
const htmlPath = path.join(__dirname, "api")

app.use(express.static("."))

app.get("/", (req, res) => {

})


app.listen(3000, () => {console.log("API on.")})