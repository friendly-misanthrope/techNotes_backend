const allowedDomains = require('./allowedDomains')

const corsOptions = {
  origin: (origin, cb) => {
    if (allowedDomains.indexOf(origin) !== -1 || !origin){
      cb(null, true);
    } else {
      cb(new Error('CORS policy has blocked this request'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

module.exports = corsOptions;


