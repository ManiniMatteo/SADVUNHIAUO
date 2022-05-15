const express = require('express');
const cors = require('cors');
const {
  changeOrder,
  deleteOrder,
  createOrder,
  getOrderList,
  getOrder,
  payOrder
} = require('./model.js')

const app = express()
const port = 3000

// Api:
// creare un ordine m post
// pagare l'ordine m
// lista degli ordini m
// modificare l'ordine
// stato dell'ordine m
// cancellare l'ordine m

app.use(express.json())
app.use(cors(
  { origin: "https://web.postman.co" }
))

app.post('/orders', async (req, res) => {
  console.log(req.body);
  const newOrder = await createOrder(req.body);
  console.log(newOrder);
  res.json({
    _links: {
      self: `http://localhost:3000/orders/${newOrder.insertedId}`,
      pay: `http://localhost:3000/orders/${newOrder.insertedId}/pay`
    }
  });
})

// http://localhost:3000/orders?status=CREATED
app.get("/orders", async (req, res) => {
  const status = req.query.status;
  const orders = await getOrderList(status);
  res.json(orders);
})


app.delete("/orders/:id", async (req, res) => {
  console.log(req.params);
  const id = req.params.id;
  await deleteOrder(id)
  res.json(id);
})

app.get("/orders/:id", async (req, res) => {
  const id = req.params.id;
  let order = await getOrder(id);
  if (order == null) {
    // L'ordine non esiste
    res
      .status(404)
      .json({ message: "L'ordine cercato non esiste" })
  } else {
    // L'ordine esiste
    res.json(order);
  }
})


app.put("/orders/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  let [result, err] = await changeOrder(id, body);
  if (err == 404) {
    res.status(404).json({ msg: "L'orden non esiste" })
  } else if (err == 403) {
    res.status(403).json({ msg: "Non puoi cambiare questo ordine" })
  } else {
    res.json(result)
  }
})

app.put("/orders/:id/pay", async (req, res) => {
  console.log(req.params);
  const id = req.params.id;
  await payOrder(id)
  res.json(id);
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})