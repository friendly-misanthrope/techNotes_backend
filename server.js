const express = require('express');
const app = express();
const path = require('path');
const { logger } = require('./middleware/logger');
const { errHandler } = require('./middleware/errHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const PORT = process.env.PORT || 3500;
require('./config/mongoose.config');

/* CUSTOM MIDDLEWARE */
app.use(logger);

/* BUILT-IN MIDDLEWARE */
app.use('/', express.static(path.join(__dirname, 'public')));

/* THIRD-PARTY MIDDLEWARE */
app.use(cookieParser());
app.use(cors(corsOptions));


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
    res.type('text').send("404 Not Found");
  }
});

/* ERROR CATCHING MIDDLEWARE */
app.use(errHandler);

/* REQUEST LISTENER */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})