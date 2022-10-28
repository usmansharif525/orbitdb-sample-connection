import React, { Component, useState } from "react";
import P2PNode from "../assets/node";
const IPFS = require("ipfs-core");
const OrbitDB = require("orbit-db");

const { fromString: uint8ArrayFromString } = require("uint8arrays/from-string");
const { toString: uint8ArrayToString } = require("uint8arrays/to-string");

export default class Home extends Component {
  async componentDidMount() {
    const { Ed25519Provider } = require("key-did-provider-ed25519");
    const { default: KeyResolver } = require("key-did-resolver");
    const Identities = require("orbit-db-identity-provider");
    Identities.DIDIdentityProvider.setDIDResolver(KeyResolver.getResolver());

    const seed = new Uint8Array(32); // 32 bytes of entropy (Uint8Array)
    seed[0] = 123;
    const didProvider = new Ed25519Provider(seed);
    const thisIdentity = await Identities.createIdentity({
      type: "DID",
      didProvider,
    });

    // Create IPFS instance
    const ipfsOptions = {
      repo: "./ipfs",
      EXPERIMENTAL: {
        pubsub: true,
      },
      config: {
        Addresses: {
          Swarm: [
            // Use IPFS dev signal server
            // Websocket:
            // '/dns4/ws-star-signal-1.servep2p.com/tcp/443/wss/p2p-websocket-star',
            // '/dns4/ws-star-signal-2.servep2p.com/tcp/443/wss/p2p-websocket-star',
            // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
            // WebRTC:
            // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
            "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
            "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
            "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/",
            // Use local signal server
            // '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star',
          ],
        },
      },
    };
    const ipfs = await IPFS.create(ipfsOptions);

    // Create OrbitDB instance
    const orbitdb = await OrbitDB.createInstance(ipfs, {
      identity: thisIdentity,
    });

    const db = await orbitdb.feed("orbit-db.issues");
    window.document.getElementById("test1").innerText = JSON.stringify(
      orbitdb.identity
    );
    const hash = await db.add("hello world! " + Date.now());
    const event = db.get(hash).payload.value; //.map((e) => e.payload.value);
    console.log("event", event, hash, db.get(hash).payload);
    console.log("db", db.get(""));
    setInterval(async () => {
      // get all entries
	  const entries = db.iterator({ limit: -1 }).collect()
	  console.log("entries", entries)     
	  entries.forEach((entry) => {
		console.log(entry.payload.value);
	  });
      let hashes = entries.map((e) => e.hash+' => '+e.payload.value +' <br>');

      window.document.getElementById("test2").innerHTML = hashes
      await db.add("hello world2! " + Date.now() + orbitdb.identity.publicKey);
    }, 2000);
  }

  render() {
    return (
      <>
        <p>hello world!</p>
        <p id="test1"></p>
        <p id="test2"></p>
        {/*
        <input id="input"></input>
        <button
          onClick={() =>
            this.state.node.pubsub.publish(
              this.state.topic,
              uint8ArrayFromString(
                window.document.getElementById("input").value
              )
            )
          }
        >
          submit
        </button>
        <p>
          {" "}
          got message: <span id="output"></span>
        </p>
        <p>number of peers: {this.state.numPeers} </p>

		*/}
      </>
    );
  }
}
