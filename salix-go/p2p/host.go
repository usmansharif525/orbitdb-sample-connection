package p2p

import (
	"context"
	//"time"

	"github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"

	//connmgr "github.com/libp2p/go-libp2p-connmgr"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/routing"
	noise "github.com/libp2p/go-libp2p-noise"
	libp2ptls "github.com/libp2p/go-libp2p-tls"
)

func newDefaultHost(sk crypto.PrivKey, ctx context.Context) (host.Host, *dht.IpfsDHT, error) {

	// I hate that we have to do this but this works for now
	sacrifice, _ := libp2p.New(context.Background())
	defer sacrifice.Close()

	var kdht *dht.IpfsDHT
	// Setup a routing configuration with the KadDHT
	routing := libp2p.Routing(func(h host.Host) (routing.PeerRouting, error) {
		kad, err := dht.New(ctx, h)
		kdht = kad
		return kad, err
	})

	h, err := libp2p.New(
		ctx,
		// Use the keypair we generated
		libp2p.Identity(sk),
		// Multiple listen addresses
		// TODO: Fix jank address generation
		libp2p.ListenAddrs(sacrifice.Addrs()...),
		// support TLS connections
		libp2p.Security(libp2ptls.ID, libp2ptls.New),
		// support noise connections
		libp2p.Security(noise.ID, noise.New),
		// support any other default transports (TCP)
		libp2p.DefaultTransports,
		// Let's prevent our peer from having too many
		// connections by attaching a connection manager.
		/*
			libp2p.ConnectionManager(connmgr.NewConnManager(
				32,          // Lowwater
				1024,        // HighWater,
				time.Minute, // GracePeriod
			)),
		*/
		// Attempt to open ports using uPNP for NATed hosts.
		libp2p.NATPortMap(),
		// Let this host use the DHT to find other hosts
		routing,
		// Let this host use relays and advertise itself on relays if
		// it finds it is behind NAT. Use libp2p.Relay(options...) to
		// enable active relays and more.
		libp2p.EnableAutoRelay(),
		// If you want to help other peers to figure out if they are behind
		// NATs, you can launch the server-side of AutoNAT too (AutoRelay
		// already runs the client)
		//
		// This service is highly rate-limited and should not cause any
		// performance issues.
		libp2p.EnableNATService(),
	)
	return h, kdht, err
}
