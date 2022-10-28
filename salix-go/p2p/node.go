package p2p

import (
	"context"
	"log"
	"time"

	//"fmt"

	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	discovery "github.com/libp2p/go-libp2p-discovery"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
)

type Node struct {
	ID         string
	Ctx        context.Context
	Host       host.Host
	DHT        *dht.IpfsDHT
	Gossip     *pubsub.PubSub
	SalixTopic TopicSub
	Store      Store
}

func (n *Node) Connect(pi peer.AddrInfo) error {
	err := n.Host.Connect(context.Background(), pi)
	if err != nil {
		return err
	}
	b, err := n.DHT.RoutingTable().TryAddPeer(pi.ID, true, false)
	if err != nil {
		return err
	}
	if b == false {
		println("oop!")
	}
	/*
		s, err := n.Host.NewStream(n.Ctx, addr.ID, GossipProtocolPrefix)
		if err != nil {
			return err
		}
		go n.GossipStreamHandler(s)
	*/
	return nil
}

func (n *Node) Close() {
	n.Host.Close()
}

func (n *Node) Publish(msg []byte) error {
	err := n.SalixTopic.Topic.Publish(n.Ctx, msg)
	return err
}

func (n *Node) GossipHandler() {
	go n.GossipReader()
}

func (n *Node) GossipReader() {
	for {
		m, err := n.SalixTopic.Subscription.Next(n.Ctx)
		if err != nil {
			log.Panicln(n.Host.ID().Pretty() + " Error: " + err.Error())
		}
		log.Println(n.Host.ID().Pretty() + " got: " + string(m.Data))
	}
}

func (n *Node) Advertise() {
	var routingDiscovery = discovery.NewRoutingDiscovery(n.DHT)
	discovery.Advertise(n.Ctx, routingDiscovery, DiscoveryPrefix)
}

func (n *Node) Discover() {
	var routingDiscovery = discovery.NewRoutingDiscovery(n.DHT)
	discovery.Advertise(n.Ctx, routingDiscovery, DiscoveryPrefix)

	ticker := time.NewTicker(time.Second * 1)
	defer ticker.Stop()

	for {
		select {
		case <-n.Ctx.Done():
			return
		case <-ticker.C:

			peers, err := discovery.FindPeers(n.Ctx, routingDiscovery, DiscoveryPrefix)
			if err != nil {
				log.Fatal(err)
			}

			for _, p := range peers {
				if p.ID == n.Host.ID() {
					continue
				}
				if n.Host.Network().Connectedness(p.ID) != network.Connected {
					_, err = n.Host.Network().DialPeer(n.Ctx, p.ID)
					if err != nil {
						continue
					}
				}
			}
		}
	}
}
