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
  RESPONDER_SIMULATOR: get('RESPONDER_SIMULATOR').asString(),

  // Reject web socket payloads greater than this many bytes (2KB by default)
  WS_MAX_PAYLOAD: get('WS_MAX_PAYLOAD').default(2048).asIntPositive(),

  // Send a heartbeat to clients every so often to keep connections open
  WS_HEARTBEAT_INTERVAL: get('WS_HEARTBEAT_INTERVAL').default('15000').asIntPositive(),

  // If a player action is not received within this time we close their socket (5 min default)
  WS_ACTIVITY_TIMEOUT_MS: get('WS_ACTIVITY_TIMEOUT_MS').default(5 * 60 * 1000).asIntPositive(),
};

export = config;
