const express = require('express');
const cors = require("cors");
const app = express();
const path = require('path');
const postRoutes = require("./routes/postRoutes.js");
const newsletterRoutes = require('./routes/newsletterRoutes.js');


app.use(express.json());
app.use(cors());
app.use('/api/posts', postRoutes);
app.use('/api/newsletter', newsletterRoutes);


app.use(express.static(path.join(__dirname, '../frontend/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'home.html'));
});

app.get('/admin/dashboard/Yehovah', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});

app.get('/post/:postid', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'single_post.html'));
});


module.exports = app; 
