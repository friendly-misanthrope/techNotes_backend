const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3500;

/* BUILT-IN MIDDLEWARE */
app.use('/', express.static(path.join(__dirname, 'public')));

/* ROUTES */
app.use('/', require('./routes/root.route'));


/* 404 CATCH-ALL */
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({message: "404 Not Found"});
  } else {
    res.type('text').send("404 Not Found")
  }
})

/* REQUEST LISTENER */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})