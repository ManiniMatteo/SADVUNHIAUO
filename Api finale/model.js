const { exec } = require("child_process");
const { errorMonitor } = require("events");
const { MongoClient, ObjectId } = require("mongodb")
let client = null;

const getClient = async () => {
    if (client != null) {
        return client;
    }
    client = new MongoClient("mongodb://localhost:27017")
    await client.connect();
    return client;
}

const getCollection = async () => {     //il nostro database
    client = await getClient();
    const collection = await client.db("Api").collection("Utente");
    return collection;
}
const getCollection2 = async () => {     //il nostro database
    client = await getClient();
    const collection = await client.db("Api").collection("Notes");
    return collection;
}



const createUser = async (user) => {
    const collection = await getCollection()
    return collection.insertOne(user)
}
const getUser = async () => {
    const collection = await getCollection()
    
    return collection.find({}).toArray();
    
}
const getUserNotes = async (_id) => {
    const collection = await getCollection()
    const collection2 = await getCollection2()
    return collection2.find({userid: new ObjectId(_id)},{userid:0}).toArray();
}
const deleteUser= async(_id) => {
    const collection = await getCollection()
    const collection2 = await getCollection2()
    const collNote = await collection2.find({}).toArray()
    const {deletedCount} = await collection.deleteOne({_id: ObjectId(_id)});
    const {deletedCount1} = await collection2.deleteMany({userid: ObjectId(_id)});
    return deletedCount
}
const createNotes = async (note) => {
    const collection = await getCollection()
    const collection2 = await getCollection2()
    //const exuserid = await collection.find({_id:ObjectId(note.userid)}).project({_id})
    //const error=false
    //console.log(exuserid)
    // if (exuserid != null)
    // {
        note.userid=new ObjectId(note.userid)
        const {insertedId} = await collection2.insertOne(note)
        const { } = await collection.updateOne({_id:note.userid},{$push : {notes : insertedId }})
        //return error
    // }
    // else{
    //     return  error=true
    // }
    
}  

const getNotes = async () => {
    const collection = await getCollection2()
    return collection.find({}).toArray();
}
const deleteNotes= async(_id) => {
    const collection2 = await getCollection2()
    const collection = await getCollection()
    const {deletedCount } = await collection2.deleteOne({_id: ObjectId(_id)});
    if(deletedCount == 0)
    {
        return deletedCount
    }
    else
    {
        const  {matchedCount } = await collection.updateOne({notes : {$in :[ObjectId(_id)]}},{$pull:{notes: ObjectId(_id)}})
        return deletedCount
    }
    
}
const getNotesPages= async(_id) => {
    const collection = await getCollection2()
    return collection.find({_id: new ObjectId(_id)}).project({"pages" : 1}).toArray();
}
const deleteNotesIDPages= async(_id,num) => {
    const collection = await getCollection2()
    return collection.deleteOne({_id: new ObjectId(_id),"Pages":num}).toArray();
}
const ModifyUser = async (_id,body) => {
    const collection = await getCollection()
    const {matchedCount} = await collection.updateOne({_id:new ObjectId(_id)}, {$set:{...body}})
    return matchedCount
}
const ModifyNotes = async (_id,body) => {
    const collection = await getCollection2()
    const {matchedCount} = await collection.updateOne({_id:new ObjectId(_id)}, {$set:{...body}})
    return matchedCount
}


const ModifyPages = async (_id,num, body) => {                  //per ora non funziona 
    const collection2 = await getCollection2()
    const nota = collection2.find({_id: ObjectId(_id)}).toArray()
    let newNota={}
    nota1 = nota[0]
    if(nota.length == 0)
    {
        return 0
    }
    else
    {
        for (let i = 0; i < nota1.pages.length; i++) {
            nota2 = nota1.pages[i]
            if(nota2.Num == num)
            {
                newNota = nota2
                break
            }
        }
        newNota.Contenuto  = body.Contenuto
        nota1.pages[num-1]=newNota
        const {matchedCount} = await collection.updateOne({_id:new ObjectId(_id)}, {$set:{...nota1}})
        return matchedCount
    }
}
module.exports = {
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
}
