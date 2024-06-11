const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/techNotes')
  .then(() => console.log('Database connection established'))
  .catch(e => console.log('Connection to database failed', e));