const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (msg, fileName) => {
  const dateTime = `${format(new Date(), 'yyMMdd\tHH:mm:ss')}`;
  const logItem = `${dateTime}\t${uuid()}\t${msg}\n`;
  const logPath = path.join(__dirname, '..', 'logs')

  try {
    if (!fs.existsSync(path.join(logPath))) {
      await fsPromises.mkdir(logPath);
    }
    await fsPromises.appendFile(path.join(logPath, fileName), logItem);
  } catch (e) {
    console.log(e);
  }
}