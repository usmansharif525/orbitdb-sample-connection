package p2p

import "sync"

type Store struct {
	Lock  sync.Mutex
	Store []Entry
}
