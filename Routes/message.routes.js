const router = require('express').Router();
const messageController = require('../Controllers/message.controller')

//cruds
router.post('/', messageController.createMessage);
router.get('/:user', messageController.fetchMessages);
router.delete('/:id/:conversationId', messageController.deleteMessage);

module.exports = router;