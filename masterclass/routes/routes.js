
const express = require('express');
const router = express.Router();
const {
    getNotes, 
    createNote,
    updateNote,
    deleteNote,
    patchNote,

} = require('../controllers/notecontroller'); 

router.get('/', getNotes);

router.post('/', createNote); 

router.put('/:id', updateNote);

router.delete('/:id', deleteNote);

router.patch('/:id', patchNote);


module.exports = router;