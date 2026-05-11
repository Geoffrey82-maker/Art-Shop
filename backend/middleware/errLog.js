const { logEvents } = require('../middleware/logEvents');

const errLog = (err, req, res, next) => {
  logEvents(`${err.name}: ${err.message}`, 'errLog.txt');
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = errLog;