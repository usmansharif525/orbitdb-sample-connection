package main

import (
	//"context"

	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/ipratt-code/salix/p2p"
	//"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/multiformats/go-multiaddr"
)

func main() {
	run()
}

func run() {
	/*
		// The context governs the lifetime of the libp2p node.
		// Cancelling it will stop the the host.
		ctx, cancel := context.WithCancel(context.Background())
		p2p.DHTContext = ctx

		defer cancel()

		// Now, normally you do not just want a simple host, you want
		// that is fully configured to best support your p2p application.
		// Let's create a second host setting some more options.

		// Set your own keypair
		sk1, _, err := crypto.GenerateKeyPair(
			crypto.Ed25519, // Select your key type. Ed25519 are nice short
			-1,             // Select key length when possible (i.e. RSA).
		)

		if err != nil {
			panic(err)
		}

		h1, _ := p2p.NewNode(sk1, ctx)

		sk2, _, err := crypto.GenerateKeyPair(
			crypto.Ed25519, // Select your key type. Ed25519 are nice short
			-1,             // Select key length when possible (i.e. RSA).
		)

		if err != nil {
			panic(err)
		}

		h2, _ := p2p.NewNode(sk2, ctx)
	*/

	h1, _ := p2p.NewTestNode()
	h2, _ := p2p.NewTestNode()
	h3, _ := p2p.NewTestNode()

	defer h1.Close()
	defer h2.Close()
	defer h3.Close()

	log.Printf("Hello World, my h1's ID is %s\n", h1.Host.ID().Pretty())
	log.Printf("Hello World, my h2's ID is %s\n", h2.Host.ID().Pretty())
	log.Printf("Hello World, my h2's ID is %s\n", h3.Host.ID().Pretty())

	// The last step to get fully up and running would be to connect to
	// bootstrap peers (or any other peers). We leave this commented as
	// this is an example and the peer will die as soon as it finishes, so
	// it is unnecessary to put strain on the network.

	// This connects to public bootstrappers
	/*for _, addr := range dht.DefaultBootstrapPeers {
		pi, _ := peer.AddrInfoFromP2pAddr(addr)
		// We ignore errors as some bootstrap peers may be down
		// and that is fine.
		log.Printf("Bootstrapping to peer %s... ", pi.ID)
		err := h.Connect(ctx, *pi)

		if err != nil {
			println("FAIL")
		} else {
			println("SUCCESS")
		}
	}*/

	m, _ := multiaddr.NewMultiaddr(h2.Host.Addrs()[0].String() + "/p2p/" + h2.Host.ID().Pretty())
	a, err := peer.AddrInfoFromP2pAddr(m)
	if err != nil {
		panic(err)
	}

	h1.Connect(*a)

	m, _ = multiaddr.NewMultiaddr(h3.Host.Addrs()[0].String() + "/p2p/" + h3.Host.ID().Pretty())
	a, err = peer.AddrInfoFromP2pAddr(m)
	if err != nil {
		panic(err)
	}

	h1.Connect(*a)

	go h1.Advertise()
	go h2.Advertise()
	go h3.Advertise()

	/*
		go h1.GossipHandler()
		go h2.GossipHandler()
		go h3.GossipHandler()


		i := 0
		for {
			err = h1.Publish([]byte(fmt.Sprintf("%d", i)))
			if err != nil {
				panic(err)
			}
			time.Sleep(time.Second)
			i++
		}
	*/

	println("discovering")
	h2.Discover()
	println("discovered peers")

	/*
		s, _ := h1.Host.NewStream(ctx, h2.Host.ID(), willow.WillowProtocolPrefix)
		h1.WillowStreamHandler(s)
	*/
	sigCh := make(chan os.Signal)
	signal.Notify(sigCh, syscall.SIGKILL, syscall.SIGINT)
	<-sigCh
}
