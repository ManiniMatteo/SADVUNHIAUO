const express = require('express');
const { MongoClient } = require("mongodb");
const cors = require('cors');
const{
    createUser,
    getUser,
    getUserNotes,
    deleteUser,
    createNotes,
    getNotes,
    deleteNotes,
    getNotesPages,
    deleteNotesIDPages,
    ModifyUser,
    ModifyNotes,
    ModifyPages
}=require('./model.js')
const app = express()
const port = 3000

app.use(express.json())
app.use(cors(
    { origin: "https://web.postman.co" }
))



app.post('/users', async(req, res) => {   //creazione utenti
    const acceptedKeys = {
        name: true,
        notes: true,
    }

    const newUser = req.body

    const missings = Object.keys(acceptedKeys).filter(k => !newUser[k])
    if (missings.length > 0) {
        res.status(400).json({
            msg: `Mancano '${missings}'`
        })
        return
    }

    const unknwownKeys = Object.keys(newUser).filter(k => !acceptedKeys[k])
    if (unknwownKeys.length > 0) {
        res.status(400).json({
            msg: `Chiavi '${unknwownKeys}' non riconosciute`
        })
        return
    }
    const User= await createUser(newUser);
    res.json("new User created") 
})



app.get('/users', async (req, res) => {   //get degli utenti
  const user = await getUser();
  res.json(user)
})



app.get('/users/:userid/notes', async (req, res) => {   //get dei quaderni dagli user
    const id=  await req.params.userid;
    const user = await getUserNotes(id);
    res.json(user);
})

app.delete('/users/:userid', async (req, res) => {  //cancellazione utente e dei suoi quaderni
    const id=  await req.params.userid;
    const user = await deleteUser(id);
    if(user == 0)
    {
        res.status(404).json({messaggio: "utente non trovato"});
    }
    res.json(user + " eliminato");
    
})

app.put('/users/:userid', async(req, res) => {   //modifica utente
    const id=  await req.params.userid;
    const acceptedKeys = {
        name: true,
        notes: true
    }
    const modifiedUser = req.body

    const unknwownKeys = Object.keys(modifiedUser).filter(k => !acceptedKeys[k])
    if (unknwownKeys.length > 0) {
        res.status(400).json({
            msg: `Chiavi '${unknwownKeys}' non riconosciute`
        })
        return
    }

    const modifyUser = await ModifyUser(id,modifiedUser)
    if(modifyUser == 0)
    {
        res.status(404).json({messaggio: "utente non trovato"});
    }
    res.json(modifyUser + "utente modificato");
})

app.post('/notes',async (req, res) => { //creazione quaderni
    const acceptedKeys = {
        name: true,
        tag: true,
        pages:true,
        userid:true
    }

    const newNotes = req.body

    const missings = Object.keys(acceptedKeys).filter(k => !newNotes[k])
    if (missings.length > 0) {
        res.status(400).json({
            msg: `Mancano '${missings}'`
        })
        return
    }

    const unknwownKeys = Object.keys(newNotes).filter(k => !acceptedKeys[k])
    if (unknwownKeys.length > 0) {
        res.status(400).json({
            msg: `Chiavi '${unknwownKeys}' non riconosciute`
        })
        return
    }
    const newNote = await createNotes(req.body);
    //if(newNote == false)
        res.json("newNote created")
    // else 
    //     res.status(404).json("Testa di cazzo crea l utente")
})

app.get('/notes', async(req, res) => { //stampa di tutte le note
    const note = await getNotes();
    res.json(note);
})

app.put('/notes/:id', async(req, res) => {   //modifica delle note 
    const id=  await req.params.id;
    const acceptedKeys = {
        name: true,
        tag: true
    }
    const modifiedNotes = req.body

    const unknwownKeys = Object.keys(modifiedNotes).filter(k => !acceptedKeys[k])
    if (unknwownKeys.length > 0) {
        res.status(400).json({
            msg: `Chiavi '${unknwownKeys}' non riconosciute`
        })
        return
    }

    const ModifiedNotes = await ModifyNotes(id,modifiedNotes)
    if(ModifiedNotes == 0)
    {
        res.status(404).json({messaggio: "nota non trovato"});
    }
    res.json(ModifiedNotes + " nota modificata");
})

app.delete('/notes/:id', async(req, res) => {   //eliminazione delle note
    const id=  await req.params.id;
    const deletNote = await deleteNotes(id);
    if(deletNote == 0)
    {
        res.status(404).json({messaggio: "nota non trovato"});
    }
    res.json(deletNote + " nota eliminata");

})

app.get('/notes/:id/pages', async(req, res) => {  //stampa delle pagine di un quaderno
    const id=  await req.params.id;
    const page = await getNotesPages(id);
    res.json(page);
})

app.put('/notes/:id/pages/:num', async(req, res) => { //modifica delle pagine in un quaderno non funzionante
    const id = await req.param.id;
    const num = await req.param.num;

    const acceptedKeys = {
        Contenuto: true
    }



    const modifiedNotesPages = req.body
    
    const missings = Object.keys(acceptedKeys).filter(k => !modifiedNotesPages[k])
    if (missings.length > 0) {
        res.status(400).json({
            msg: `Mancano '${missings}'`
        })
        return
    }

    const unknwownKeys = Object.keys(modifiedNotesPages).filter(k => !acceptedKeys[k])
    if (unknwownKeys.length > 0) {
        res.status(400).json({
            msg: `Chiavi '${unknwownKeys}' non riconosciute`
        })
        return
    }


    const page = await ModifyPages(id, num, modifiedNotesPages);
    if(page == 0)
    {
        res.status(404).json({messaggio: "nota non trovato"});
    }
    res.json(page + " nota modificata");
})

app.delete('/notes/:id/pages/:num', async(req, res) => {
    const id=  await req.params.id;
    const num=  await req.params.num;
    const page = await deleteNotesIDPages(id,num);
    console.log(page);
    res.json(page);
})





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })




