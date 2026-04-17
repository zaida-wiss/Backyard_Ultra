const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const runnersRouter = require('./routes/runners');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/runners', runnersRouter);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Sökvägen ${req.path} finns inte`,
      status: 404,
    },
  });
});

module.exports = app;
