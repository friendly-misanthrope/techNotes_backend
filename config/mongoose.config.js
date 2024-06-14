const mongoose = require('mongoose');
require('dotenv').config();
const { logEvents } = require('../middleware/logger')

mongoose.connect(process.env.DB_CONNECTION)
  .then(() => console.log('Database connection established'))
  .catch(e => console.log('Connection to database failed', e));

mongoose.connection.on('error', (err) => {
  console.log(err);
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrs.log'
  )
});