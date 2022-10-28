"use strict";

const { fromString: uint8ArrayFromString } = require("uint8arrays/from-string");
const { toString: uint8ArrayToString } = require("uint8arrays/to-string");

export default class P2PNode {
  node: any;
  topic: string = "test";
  numPeers: number = 0;
  storemsgs: boolean = false;
  msgs: any[] = [];

  constructor(storemsgs?: boolean) {
    this.storemsgs = storemsgs;
  }

  async start() {
    const Libp2p = require("libp2p");
    const WebSockets = require("libp2p-websockets");
    const WebRtcStar = require("libp2p-webrtc-star");
    const WebRtcDirect = require("libp2p-webrtc-direct");
    const { NOISE } = require("libp2p-noise");
    const MPLEX = require("libp2p-mplex");
    const Bootstrap = require("libp2p-bootstrap");
    const Gossipsub = require("libp2p-gossipsub");

    this.node = await Libp2p.create({
      modules: {
        transport: [WebSockets, WebRtcStar, WebRtcDirect],
        connEncryption: [NOISE],
        streamMuxer: [MPLEX],
        peerDiscovery: [Bootstrap],
        pubsub: Gossipsub,
      },
      addresses: {
        listen: [
          "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
          "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        ],
      },
      config: {
        peerDiscovery: {
          [Bootstrap.tag]: {
            enabled: true,
            list: [
              "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
              "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
            ],
          },
        },
        pubsub: {
          enabled: true,
          emitSelf: true,
        },
      },
    });

    await this.node.start();
    console.log(this.node);

    // setting node properties

    const advertiseAddrs = this.node.multiaddrs;
    console.log(
      "your salix node is advertising the following addresses: ",
      advertiseAddrs.toString()
    );

    this.node.pubsub.subscribe(this.topic);

    this.node.on("peer:discovery", (peer) => {
      //console.log("found peer: " + peer._idB58String);
      this.numPeers = this.numPeers += 1;
      //console.log(this.numPeers);
    });

    this.node.pubsub.on(this.topic, (msg) => {
      console.log(`got message: ${uint8ArrayToString(msg.data)}`);
      if (this.storemsgs === true) {
        this.msgs.push(msg);
      }
      /*window.document.getElementById("output").innerText = uint8ArrayToString(
        msg.data
      );*/
    });

    this.publish("test");
  }

  publish(msg: string) {
    this.node.pubsub.publish(this.topic, uint8ArrayFromString(msg));
  }

  next() {
    let ret = this.msgs[0];
    this.msgs = this.msgs.slice(1);
    return ret;
  }
}
