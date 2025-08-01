---
title: "Why Your Distributed Apps Need Structure"
category: Architecture
tags:
- Infrastructure
- Distributed
- Events
- Avro
- Schema
layout: blog/post
---

Distributed applications *should* communicate by the passing of messages between their interfaces (if you're reading a shared database, you're doing it wrong, and we should probably have a chat!). These messages, must conform to a schema, in order for the receiving system to understand the intent of message.

In a web facing application these schemas where usually encoded as part of the API specification, with validation rules in place to prevent the acceptance of malformed, or otherwise incorrect data. With the client being told, as part of the request whether or not the service will accept it.

If your application is event driven, you need a different approach. Events are fire-and-forget, just like sending a letter, the sender doesn't know if any of the consumers will accept their event, with those events potentially being lost.

![Postbox]({{ '/assets/images/posts/2025/distributed-apps/postbox_400x400.png' | relative_url }})

How do we handle these things safely then?

## Schemas

By enforcing schemas across all messages that are sent, making sure that when we produce an event it must, at least, be syntactically valid. But also must provide a way of packaging the message up so that it can be read by other applications.

In short, a distributed system must: 
1. Have a way of defining what the data *should* look like
2. Be able to share those definitions
3. Use those definitions to serialize actual data
4. Check that the serialized data is valid, and conforms to the schema
5. (Optionally) Provide a way to change schemas over time

There are a couple of contenders.

* [Apache Avro](https://avro.apache.org/)
* [Protocol Buffers](https://protobuf.dev/)
* [Apache Thrift](https://thrift.apache.org/)
* [JSON Schema](https://json-schema.org/)

Ultimately the selection will be dependant on your stack, as they all offer similar functionality. However we're currently using Avro so with Avro, lets step through the above list.

## Data Definition

Avro provides two ways to define schemas, either through JSON, or it's IDL. JSON is more portable, as the IDL is 



