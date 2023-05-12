const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = 3001;
const DB_NAME = "tutorial"

var UserRouter = require("./routes/Users");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connection to MongoDB
mongoose.connect(`mongodb://mongodb:27017/new-docker-db`, { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', function() {
    console.log("MongoDB database connection established successfully !");
})

app.use("/user", UserRouter);

app.listen(process.env.PORT || PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
