const router = require('express').Router();
const messageController = require('../Controllers/message.controller')

//cruds
router.post('/', messageController.createMessage);
router.get('/:conversationId', messageController.fetchMessages);

module.exports = router;