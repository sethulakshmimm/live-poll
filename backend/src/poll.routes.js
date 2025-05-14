const express = require('express');
const router = express.Router();
const pollController = require('./poll.controller');

router.post('/', pollController.createPoll);
router.post('/:id/vote', pollController.votePoll);
router.get('/:id', pollController.getPoll);

module.exports = router;
