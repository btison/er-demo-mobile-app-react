import { CloudEvent } from "cloudevents";
import { IHeaders } from "kafkajs";
import { deserialize } from "./kafka";

export interface Binding {
    toEvent: Deserializer;
}

export interface Headers extends IHeaders {
    [key: string]: Buffer | string | undefined;
}

export interface Message {
    headers: Headers;
    body: Buffer | string | unknown;
}

export interface Deserializer {
    (message: Message): CloudEvent;
}

export const KafkaMessage: Binding = {
    toEvent: deserialize as Deserializer,
};