const express = require('express');

const router = express.Router();

// In-memory-data för vecka 1 (ingen databas ännu).
// När servern startas om återställs datan.
const runners = [
  { id: 1, name: 'Erik Marklund', status: 'active', lapTimes: [] },
  { id: 2, name: 'Lars Kolmodin', status: 'active', lapTimes: [] },
  { id: 3, name: 'Mikael Söderberg', status: 'active', lapTimes: [] },
];

// GET /api/v1/runners
// Hämtar alla löpare (200 OK som standard vid res.json).
router.get('/', (req, res) => {
  res.json(runners);
});

// GET /api/v1/runners/:id
// req.params.id kommer alltid in som sträng -> konvertera till Number.
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const runner = runners.find((currentRunner) => currentRunner.id === id);

  // Om resursen saknas returnerar vi 404 Not Found.
  if (!runner) {
    return res.status(404).json({
      error: {
        code: 'RUNNER_NOT_FOUND',
        message: `Ingen löpare med id ${id} hittades`,
        status: 404,
      },
    });
  }

  return res.json(runner);
});

// POST /api/v1/runners
// Skapar en ny löpare från req.body.
router.post('/', (req, res) => {
  const { name } = req.body;

  // Enkel inputvalidering: name måste finnas och vara text.
  // Vid ogiltig input: 400 Bad Request.
  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'namn krävs',
        status: 400,
      },
    });
  }

  const newRunner = {
    id: runners.length + 1,
    name,
    status: 'active',
    lapTimes: [],
  };

  // Spara i in-memory-listan.
  runners.push(newRunner);

  // Vid skapad resurs: 201 Created.
  return res.status(201).json(newRunner);
});

module.exports = router;
