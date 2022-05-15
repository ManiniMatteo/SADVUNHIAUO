// @ts-check
const express = require('express');
const cors = require('cors');
const { getCollectcion } = require('./model');
const { ObjectId } = require('bson');
const multer = require('multer')
const uploadPath = 'es3/uploads/';
const upload = multer({ dest: uploadPath })
const fs = require('fs');
const { uuid } = require('./util');


const app = express()
const port = 3000

app.use(express.json())
app.use(cors())


app.post("/buckets", async (req, res) => {

    const acceptedKeys = {
        name: true,
        maxSize: true
    }

    const newBucket = req.body

    // Ceck for missing keys
    const missings = Object.keys(acceptedKeys).filter(k => !newBucket[k])
    if (missings.length > 0) {
        res.status(400).json({
            msg: `Mancano '${missings}'`
        })
        return
    }

    // Check for unknown keys
    const unknwownKeys = Object.keys(newBucket).filter(k => !acceptedKeys[k])
    if (unknwownKeys.length > 0) {
        res.status(400).json({
            msg: `Chiavi '${unknwownKeys}' non riconosciute`
        })
        return
    }

    const buckets = await getCollectcion("buckets");
    newBucket.objects = []
    newBucket.createdAt = new Date()

    await buckets.insertOne(newBucket);

    res.json(newBucket)


})



app.post("/buckets/:id", upload.single("object"), async (req, res) => {
    const bucketId = req.params.id;
    const objectId = uuid(14)

    const buckets = await getCollectcion("buckets");

    const { matchedCount } = await buckets.updateOne(
        {
            _id: new ObjectId(bucketId)
        },
        {
            $push: {
                objects: { ...req.file, objectId }
            }
        }
    )

    if (matchedCount == 0) {
        res.status(404).json({ msg: "Buckets non esiste" })
        // Elimino il file caricato
        const filePath = req.file.path
        fs.unlinkSync(filePath)
        return
    }

    res.json({
        uploaded: objectId
    })
})


app.get("/buckets/:id/:objId", async (req, res) => {
    const bucketId = req.params.id;
    const objId = req.params.objId;

    const buckets = await getCollectcion("buckets");

    const bucketsCursor = await buckets.find(
        {
            _id: new ObjectId(bucketId)
        }
    )

    const bucketList = await bucketsCursor.toArray();

    if (bucketList.length == 0) {
        res.status(404).json({ msg: "Buckets non esiste" })
        return
    }

    const bucket = bucketList[0];
    const objectToSend = bucket.objects.find(obj => obj.objectId == objId)

    res.sendFile(
        objectToSend.path,
        {
            root: ".",
            headers: {
                "content-type": objectToSend.mimetype
            }
        }
    )
})






app.put("/buckets/:id/:objId", upload.single("object"), async (req, res) => {
    const bucketId = req.params.id;
    const objId = req.params.objId;

    const buckets = await getCollectcion("buckets");


    // Prendo il file vecchio
    const bucketsCursor = await buckets.find(
        {
            _id: new ObjectId(bucketId),
            "objects.objectId": objId
        }
    )

    const bucketList = await bucketsCursor.toArray();
    if (bucketList.length == 0) {
        res.status(404).json({ msg: "Buckets/object non trovato" })
        fs.unlinkSync(req.file.path)
        return
    }

    // Cancello il file vecchio
    const bucket = bucketList[0];
    const filePathToRemove = bucket.objects.find(obj => obj.objectId == objId).path
    fs.unlinkSync(filePathToRemove)


    // Aggiorno il riferimento
    await buckets.updateOne(
        {
            _id: new ObjectId(bucketId),
            "objects.objectId": objId
        },
        {
            $set: {
                "objects.$": { ...req.file, objectId: objId }
            }
        }
    )


    res.json({
        modified: objId
    })


})











app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


