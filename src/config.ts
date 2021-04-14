'use strict';

import { get } from 'env-var';

const config = {
  NODE_ENV: get('NODE_ENV').default('dev').asEnum(['dev', 'prod']),
  LOG_LEVEL: get('LOG_LEVEL').asString(),

  // HTTP and WebSocket traffic both use this port
  HTTP_PORT: get('HTTP_PORT').default(8080).asPortNumber(),

  // Kafka Bootstrap servers
  KAFKA_HOST: get('KAFKA_HOST').default('localhost:9092').asString().split(','),

  // Kafka consumer group ID
  KAFKA_GROUP_ID: get('KAFKA_GROUP_ID').default('emergency-response-app').asString(),

  // Kafka topics to consume from
  KAFKA_TOPICS: get('KAFKA_TOPIC').default('').asString().split(','),

  // services
  RESPONDER_SERVICE: get('RESPONDER_SERVICE').asString(),
  DISASTER_SIMULATOR: get('DISASTER_SIMULATOR').asString(),
  DISASTER_SERVICE: get('DISASTER_SERVICE').asString(),
  RESPONDER_SIMULATOR: get('RESPONDER_SIMULATOR').asString()
};

export = config;
