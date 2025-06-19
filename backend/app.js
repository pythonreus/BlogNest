const express = require('express');
const cors = require("cors");
const app = express();
const postRoutes = require("./routes/postRoutes.js");

app.use(express.json());
app.use(cors());
app.use('/api/posts', postRoutes);

module.exports = app; 
