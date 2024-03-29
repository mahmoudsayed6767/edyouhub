var express = require('express');
var router = express.Router();
var messageController = require('../../controllers/message/messageController');
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';
import { cache } from '../../services/caching';

/* GET users listing. */
router.get('/',requireAuth,messageController.getAllMessages);
router.route('/unseenCount')
    .get(requireAuth,messageController.unseenCount);

router.get('/lastContacts',requireAuth,messageController.findLastContacts);
router.put('/',requireAuth,messageController.updateSeen);
router.put('/updateInformed',messageController.updateInformed);

router.route('/upload')
    .post( 
        requireAuth,
            multerSaveTo('chats').single('img'),
            messageController.uploadFile
        )  
router.route('/:messageId/delete')
    .delete(requireAuth,messageController.delete);
router.route('/:friendId/deleteAll')
    .delete(requireAuth,messageController.deleteAll);
module.exports = router;