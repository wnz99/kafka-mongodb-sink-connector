#!/bin/bash

# Create dirs for Kafka / ZK data
sudo mkdir -p ./vol1/zk-data
sudo mkdir -p ./vol2/zk-txn-logs
sudo mkdir -p ./vol3/kafka-data

# Make sure user 12345 has r/w permissions
sudo chown -R 12345 ./vol1/zk-data
sudo chown -R 12345 ./vol2/zk-txn-logs
sudo chown -R 12345 ./vol3/kafka-data

echo "configure your MongoDB cluster"

docker-compose exec mongo1 /usr/bin/mongo --eval '''if (rs.status()["ok"] == 0) {
    rsconf = {
      _id : "rs0",
      members: [
        { _id : 0, host : "mongo1:27017", priority: 1.0 },
        { _id : 1, host : "mongo2:27017", priority: 0.5 },
        { _id : 2, host : "mongo3:27017", priority: 0.5 }
      ]
    };
    rs.initiate(rsconf);
}
rs.conf();'''

curl localhost:8083/connector-plugins | jq

echo "Create connector 1"

curl -X POST -H "Content-Type: application/json" -d @sink-connector-1.json http://localhost:8083/connectors | jq
curl http://localhost:8083/connectors/mongo-sink-1/status | jq

echo "Create connector 2"

curl -X POST -H "Content-Type: application/json" -d @sink-connector-2.json http://localhost:8084/connectors | jq
curl http://localhost:8084/connectors/mongo-sink-2/status | jq

echo "Create connector 3"

curl -X POST -H "Content-Type: application/json" -d @sink-connector-3.json http://localhost:8084/connectors | jq
curl http://localhost:8084/connectors/mongo-sink-3/status | jq

echo "Create Kafka topic product.events"

docker exec broker kafka-topics --zookeeper zookeeper:2181 --create --topic product.events --partitions 1 --replication-factor 1


# {"_id": "62701da0dbfa663dbbbc8328", "Name": "Hat", "Price": 25}
# {"_id": "62701dd3dbfa663dbbbc832a", "Name": "Shoe", "Price": 15}
# {"_id": "62701dd3dbfa663dbbbc832b", "Name": "Jumper", "Price": 35}
# {"_id": "62701dd3dbfa663dbbbc832c", "Name": "Jumper", "Price": 60}
