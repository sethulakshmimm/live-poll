const express = require('express');
const router = express.Router();
const pollController = require('./poll.controller');

// No need for createPoll route
router.post('/:pollId/vote', pollController.votePoll);
router.get('/:pollId', pollController.getPoll);

module.exports = router;
