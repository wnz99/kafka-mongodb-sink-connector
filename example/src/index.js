const express = require('express')
const { Kafka } = require('kafkajs')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()

const Schema = mongoose.Schema

const ProductsSchema = new Schema(
  {
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
  },
  { collection: 'Products' }
)

const ProductsModel = mongoose.model('employees', ProductsSchema)

const runApp = async () => {
  const mongoDB = 'mongodb://localhost:27020'

  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const db = mongoose.connection

  db.on('error', () => logger.info('DB connection error'))

  db.on('connected', () => logger.info('Connected to DB'))

  // KAFKA
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
  })

  const producer = kafka.producer()

  await producer.connect()

  const consumer = kafka.consumer({ groupId: 'product-example' })

  await consumer.connect()

  await consumer.subscribe({ topic: 'products' })

  // Replicate Kafka state locally
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
      })

      const msg = JSON.parse(message.value.toString())

      const result = await ProductsModel.create({
        name: msg.name,
        price: msg.price,
      })
    },
  })

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  // add a product
  app.post('/product', async (req, res) => {
    console.log(req.body)

    // send message to kafka
    await producer.send({
      topic: 'products',
      messages: [{ key: 'user1', value: JSON.stringify(req.body) }],
    })

    res.send('ok')
  })

  app.get('/products', async (req, res) => {
    const results = await ProductsModel.find()

    res.send(results)
  })

  const server = app.listen(8087, function () {
    const host = server.address().address
    const port = server.address().port

    console.log('CQR app listening at http://%s:%s', host, port)
  })
}

runApp()
