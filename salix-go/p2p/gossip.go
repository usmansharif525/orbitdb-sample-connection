package p2p

import (
	pubsub "github.com/libp2p/go-libp2p-pubsub"
)

type TopicSub struct {
	Topic        *pubsub.Topic
	Subscription *pubsub.Subscription
}
