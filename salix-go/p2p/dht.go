package p2p

import (
	"context"

	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/routing"
	dht "github.com/libp2p/go-libp2p-kad-dht"
)

const DefaultKadPrefix = "/salix/kad"

var DHTContext = context.Background()

func NewSalixDHT(h host.Host) (routing.PeerRouting, error) {
	salixDHT, err := dht.New(
		DHTContext,
		h,
		dht.ProtocolPrefix(DefaultKadPrefix),
	)
	return salixDHT, err
}
