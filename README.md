# Kafka mongodb connecetor

Docker compose example taken from: https://stackoverflow.com/questions/57544201/implement-dockerized-kafka-sink-connector-to-mongo

To run:

Create data folders:

```bash
# Create dirs for Kafka / ZK data
sudo mkdir -p ./vol1/zk-data
sudo mkdir -p ./vol2/zk-txn-logs
sudo mkdir -p ./vol3/kafka-data

# Make sure user 12345 has r/w permissions
sudo chown -R 12345 ./vol1/zk-data
sudo chown -R 12345 ./vol2/zk-txn-logs
sudo chown -R 12345 ./vol3/kafka-data
```

Run services:

```bash
docker-compose up
```

Create connector sinks:

```bash
./run.sh
```

This will create two connectors which will consume messages in the `product.events` topic and sink to two separate collections `products-1` and `products-2`.

To post a message connect to `http://localhost:8080`, browse to `topics` page and then `messages`

Example of messages:

```json
{"Name": "Hat", "Price": 25}
{"Name": "Shoe", "Price": 15}
```

