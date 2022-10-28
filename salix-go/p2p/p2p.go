package p2p

import (
	"context"

	"github.com/libp2p/go-libp2p-core/crypto"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/mr-tron/base58/base58"
)

const DiscoveryPrefix = "/salix/discover"

func NewTestNode() (*Node, error) {

	sk, _, err := crypto.GenerateKeyPair(
		crypto.Ed25519, // Select your key type. Ed25519 are nice short
		-1,             // Select key length when possible (i.e. RSA).
	)

	if err != nil {
		return nil, err
	}

	ctx := context.Background()

	h, k, err := newDefaultHost(sk, ctx)

	if err != nil {
		return nil, err
	}

	rawsk, _ := sk.Raw()

	gossip, err := pubsub.NewGossipSub(ctx, h)

	if err != nil {
		return nil, err
	}

	node := &Node{
		ID:         base58.Encode(rawsk),
		Ctx:        ctx,
		Host:       h,
		DHT:        k,
		Gossip:     gossip,
		SalixTopic: TopicSub{},
		Store:      Store{},
	}

	t, err := node.Gossip.Join(GossipProtocolTopic)

	if err != nil {
		return nil, err
	}

	node.SalixTopic.Topic = t
	s, err := node.SalixTopic.Topic.Subscribe()
	if err != nil {
		return nil, err
	}
	node.SalixTopic.Subscription = s

	//node.Host.SetStreamHandler(GossipProtocolPrefix, node.GossipStreamHandler)

	if err != nil {
		return nil, err
	}

	return node, err
}
