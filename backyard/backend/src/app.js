const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const runnersRouter = require('./routes/runners');

const app = express();

// Middleware-kedjan körs i ordning uppifrån och ner.
// CORS tillåter frontend (annan origin/port) att anropa API:t.
app.use(cors());
// Gör JSON i request body tillgänglig via req.body.
app.use(express.json());
// Loggar varje HTTP-anrop i terminalen (metod, route, status, tid).
app.use(morgan('dev'));

// Monterar runners-routes under /api/v1/runners.
// Ex: GET /api/v1/runners och GET /api/v1/runners/:id
app.use('/api/v1/runners', runnersRouter);

// Fallback för okända routes (om ingen route ovan matchar).
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Sökvägen ${req.path} finns inte`,
      status: 404,
    },
  });
});

// Exporteras för att kunna importeras i server.js och i framtida tester.
module.exports = app;
