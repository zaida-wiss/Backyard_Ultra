const express = require('express');

const router = express.Router();

const runners = [
  { id: 1, name: 'Erik Marklund', status: 'active', lapTimes: [] },
  { id: 2, name: 'Lars Kolmodin', status: 'active', lapTimes: [] },
  { id: 3, name: 'Mikael Söderberg', status: 'active', lapTimes: [] },
];

router.get('/', (req, res) => {
  res.json(runners);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const runner = runners.find((currentRunner) => currentRunner.id === id);

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

router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'name krävs',
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

  runners.push(newRunner);

  return res.status(201).json(newRunner);
});

module.exports = router;
