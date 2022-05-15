const { MongoClient, ObjectId } = require("mongodb")

const priceTable = {
    "latte": 1,
    "caffe": 1.2,
    "acqua": 0.5,
}

// {
//     _id,
//     createdAt: Date,
//     item: String ("Latte","Caffè","..."),
//     price: Number,
//     qty: Number,
//     status: String ( "CREATED" | "PAID" | "DELETED")
// }


let client = null;

const getClient = async () => {
    if (client != null) {
        return client;
    }
    client = new MongoClient("mongodb://root:root@localhost:27017/?maxPoolSize=20&w=majority")
    await client.connect();
    return client;
}

const getCollection = async () => {
    client = await getClient();
    const collection = await client.db("sturbucks").collection("orders");
    return collection;
}

const getOrderList = async (status) => {
    const collection = await getCollection()
    if (status == null) {
        return collection.find({}).toArray()
    } else {
        return collection.find({
            status: status
        }).toArray()
    }
}

const createOrder = async (order) => {

    const collection = await getCollection()
    return collection.insertOne(
        {
            ...order,
            createdAt: Date.now(),
            status: "CREATED",
            price: priceTable[order.item] * order.qty
        }
    )
}


const payOrder = async (id) => {
    const collection = await getCollection()
    return collection.updateOne({
        _id: new ObjectId(id)
    }, {
        $set: { status: "PAID" }
    })
}

const getOrder = async (id) => {
    try {
        const collection = await getCollection()
        const orders = await collection.find({
            _id: new ObjectId(id)
        }).toArray()
        if (orders.length == 0) {
            return null;
        }
        return orders[0]
    } catch {
        return null
    }

}


const deleteOrder = async (id) => {
    const collection = await getCollection()
    return collection.updateOne({
        _id: new ObjectId(id)
    }, {
        $set: { status: "DELETED" }
    })
}

const changeOrder = async (id, newOrder) => {

    const collection = await getCollection()

    const order = await getOrder(id);
    if (order == null) {
        return [null, 404];
    }

    if (order.status == "CREATED") {
        const res = await collection.updateOne({
            _id: new ObjectId(id)
        }, {
            $set: {
                item: newOrder.item,
                qty: newOrder.qty,
                createdAt: Date.now(),
                price: priceTable[newOrder.item] * newOrder.qty
            }
        })
        return [res, null]
    }

    return [null, 403];

}




module.exports = {
    getOrderList,
    createOrder,
    payOrder,
    getOrder,
    deleteOrder,
    changeOrder
}

