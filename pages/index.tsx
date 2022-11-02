import React, {Component, useState} from "react";
import P2PNode from "../assets/node";

const IPFS = require("ipfs-core");
const OrbitDB = require("orbit-db");

const {fromString: uint8ArrayFromString} = require("uint8arrays/from-string");
const {toString: uint8ArrayToString} = require("uint8arrays/to-string");

export default class Home extends Component {
    db = null;

    async componentDidMount() {
        const {Ed25519Provider} = require("key-did-provider-ed25519");
        const {default: KeyResolver} = require("key-did-resolver");
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
        // const ipfsOptions = {
        //   repo: "./ipfs",
        //   EXPERIMENTAL: {
        //     pubsub: true,
        //   },
        //   config: {
        //     Addresses: {
        //       Swarm: [
        //         // Use IPFS dev signal server
        //         // Websocket:
        //         // '/dns4/ws-star-signal-1.servep2p.com/tcp/443/wss/p2p-websocket-star',
        //         // '/dns4/ws-star-signal-2.servep2p.com/tcp/443/wss/p2p-websocket-star',
        //         // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
        //         // WebRTC:
        //         // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
        //         // "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
        //         // "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
        //         // "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/",
        //         // Use local signal server
        //         '/ip4/192.168.24.164/tcp/13579/wss/p2p-webrtc-star',
        //       ],
        //     },
        //   },
        // };
        let ipfsOptions = {
            // preload: {
            //   enabled: false
            // },
            EXPERIMENTAL: {
                pubsub: true
            },
            config: {
                Addresses: {
                    API: '/ip4/127.0.0.1/tcp/0',
                    // Swarm: ['/ip4/192.168.0.106/tcp/13579/wss/p2p-webrtc-star'],
                    // Swarm: ['/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/'],
                    Swarm: ['/ip4/203.101.178.13/tcp/13579/wss/p2p-webrtc-star'],
                    Gateway: '/ip4/0.0.0.0/tcp/0'
                },
                Bootstrap: [],
                Discovery: {
                    MDNS: {
                        Enabled: true,
                        Interval: 0
                    },
                    webRTCStar: {
                        Enabled: true
                    }
                }
            }
        };
        const ipfs = await IPFS.create(ipfsOptions);
        // IPFS PUBSUB

        // const topic = "ipfs-pubsub-topic-usman";
        // const receiveMsg = (msg) => console.log("lssss",new TextDecoder().decode(msg.data));

        // await ipfs.pubsub.subscribe(topic, receiveMsg);
        // console.log(`subscribed to ${topic}`);
        // let ipfsid = await ipfs.id();
        // window.ipfs = ipfs;
        // setInterval(async () => {

        //   const msg = uint8ArrayFromString("banana "+ new Date().getTime()+ " "+ ipfsid.id);
        //   await ipfs.pubsub.publish(topic, msg);
        //   console.log(`published ${msg.toString()} to ${topic}`);
        //   //get data from ipfs pubsub
        //   const data = await ipfs.pubsub.peers(topic);
        //   console.log('data', data);
        // }, 2000);

        // setTimeout(async () => {
        //   await ipfs.swarm.connect('/ip4/192.168.24.164/tcp/13579/wss/p2p-webrtc-star/p2p/QmWoLpqMSJyCMf5tXQ9u6PCwmERn22x8br3pr33B2rLfhD');
        //   console.log('connected');
        // }, 10000);

        // Create OrbitDB instance
        const orbitdb = await OrbitDB.createInstance(ipfs, {
            identity: thisIdentity,
        });

        this.db = await orbitdb.feed("orbit-db.issues6");
        await this.db.load();
        window.document.getElementById("test1").innerText = JSON.stringify(
            orbitdb.identity
        );
        // const hash = await this.db.add("hello Usman! " + Date.now());
        // const event = this.db.get(hash).payload.value; //.map((e) => e.payload.value);
        // console.log("event", event, hash, this.db.get(hash).payload);
        // console.log("db", this.db.get(""));
        // setInterval(async () => {
        //   // get all entries
        // const entries = db.iterator({ limit: -1 }).collect()
        // console.log("entries", entries)
        // entries.forEach((entry) => {
        // console.log(entry.payload.value);
        // });
        //   let hashes = entries.map((e) => e.hash+' => '+e.payload.value +' <br>');

        //   window.document.getElementById("test2").innerHTML = hashes
        //   await db.add("hello Office! " + Date.now() + orbitdb.identity.publicKey);
        // }, 2000);

    }

    getData = () => {
        let hashes = this.db.iterator({limit: -1}).collect().map((e) => e.hash + ' => ' + e.payload.value + ' <br>');
        console.log('hashes', hashes);
        window.document.getElementById("test2").innerHTML = hashes

        console.log("db", this.db.get(""));
    }

    addData = () => {
        this.db.add("hello Office! " + Date.now());
    }

    getPeers = async () => {
        console.log('peers', this.db._oplog._oplog.peers);
    }

    render() {
        return (
            <>
                <p>hello world!</p>
                <p id="test1"></p>
                <p id="test2"></p>
                <button onClick={() => {
                    this.addData();
                }}>Add Data
                </button>
                <button onClick={() => {
                    this.getData();
                }}>Get Data
                </button>
                <button onClick={() => {
                    this.getPeers();
                }}>Get Peers
                </button>
            </>
        );
    }
}
