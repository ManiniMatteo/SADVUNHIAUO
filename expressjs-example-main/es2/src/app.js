// @ts-check
const express = require('express');
const cors = require('cors');
const { getCollectcion } = require('./model');
const { ObjectId } = require('bson');
const { uuid } = require('./util');
const { object } = require('webidl-conversions');


const app = express()
const port = 3000



app.use(express.json())
app.use(cors())


app.get("/notes", async (req, res) => {
    const notes = await getCollectcion("notes");
    res.json(await (await notes.find({})).toArray());
})


app.post("/notes", async (req, res) => {

    const acceptedKeys = {
        user: true,
        title: true,
        tags: true,
    }

    const newNote = req.body

    // Ceck for missing keys
    const missings = Object.keys(acceptedKeys).filter(k => !newNote[k])
    if (missings.length > 0) {
        res.status(400).json({
            msg: `Mancano '${missings}'`
        })
        return
    }

    // Check for unknown keys
    const unknwownKeys = Object.keys(newNote).filter(k => !acceptedKeys[k])
    if (unknwownKeys.length > 0) {
        res.status(400).json({
            msg: `Chiavi '${unknwownKeys}' non riconosciute`
        })
        return
    }

    const notes = await getCollectcion("notes");
    const users = await getCollectcion("users");
    newNote.user = new ObjectId(newNote.user)
    newNote.pages = []

    const { insertedId } = await notes.insertOne(newNote);

    const { } = await users.updateOne(
        {
            _id: newNote.user
        },
        {
            $push: {
                notes: insertedId
            }
        }
    )


    res.json(newNote)

})




app.put("/notes/:id", async (req, res) => {

    const acceptedKeys = {
        title: true,
        tags: true,
    }

    const id = req.params.id;
    const newNote = req.body

    // Check for unknown keys
    const unknwownKeys = Object.keys(newNote).filter(k => !acceptedKeys[k])
    if (unknwownKeys.length > 0) {
        res.status(400).json({
            msg: `Chiavi '${unknwownKeys}' non riconosciute`
        })
        return
    }

    const notes = await getCollectcion("notes");

    const { matchedCount } = await notes.updateOne(
        {
            _id: new ObjectId(id)
        },
        {
            $set: {
                ...newNote
            }
        });

    if (matchedCount == 0) {
        res.status(404).json({ msg: `Dockumento ${id} non trovato` })
    }

    res.json(newNote)
})




app.post("/notes/:id/pages", async (req, res) => {

    const id = req.params.id
    const pageId = uuid(14)

    const acceptedKeys = {
        content: true,
    }

    const newPage = req.body

    // Ceck for missing keys
    const missings = Object.keys(acceptedKeys).filter(k => !newPage[k])
    if (missings.length > 0) {
        res.status(400).json({
            msg: `Mancano '${missings}'`
        })
        return
    }

    // Check for unknown keys
    const unknwownKeys = Object.keys(newPage).filter(k => !acceptedKeys[k])
    if (unknwownKeys.length > 0) {
        res.status(400).json({
            msg: `Chiavi '${unknwownKeys}' non riconosciute`
        })
        return
    }

    const notes = await getCollectcion("notes");

    await notes.updateOne(
        {
            _id: new ObjectId(id)
        },
        {
            $push: {
                pages: { ...newPage, id: pageId, }
            }
        });

    res.json({ ...newPage, id: pageId, })
})




app.get("/users/:userId/notes", async (req, res) => {

    const userId = req.params.userId;
    const users = await getCollectcion("users");

    const cursor = await users.aggregate([
        {
            $match: {
                _id: new ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "notes",
                localField: "notes",
                foreignField: "_id",
                as: "notes"
            }
        }
    ])

    res.json(await cursor.toArray())

})


app.post("/users", async (req, res) => {

    const acceptedKeys = {
        name: true,
    }

    const newUser = req.body

    // Ceck for missing keys
    const missings = Object.keys(acceptedKeys).filter(k => !newUser[k])
    if (missings.length > 0) {
        res.status(400).json({
            msg: `Mancano '${missings}'`
        })
        return
    }

    // Check for unknown keys
    const unknwownKeys = Object.keys(newUser).filter(k => !acceptedKeys[k])
    if (unknwownKeys.length > 0) {
        res.status(400).json({
            msg: `Chiavi '${unknwownKeys}' non riconosciute`
        })
        return
    }

    const users = await getCollectcion("users");

    const { insertedId } = await users.insertOne({ ...newUser, notes: [] });
    res.json({ ...newUser, _id: insertedId, notes: [] })

})




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})