package sse

import "sync"

// Hub is a tiny in-memory pub-sub indexed by trace_id. Safe for concurrent
// use. Designed for the onboarding live-tail page; not a replacement for a
// durable queue.
type Hub struct {
	mu   sync.RWMutex
	subs map[string]map[chan []byte]struct{}
}

func NewHub() *Hub {
	return &Hub{subs: make(map[string]map[chan []byte]struct{})}
}

// Subscribe returns a buffered channel that receives every Publish for the
// given key and an unsubscribe func the caller MUST invoke.
func (h *Hub) Subscribe(key string) (<-chan []byte, func()) {
	ch := make(chan []byte, 16)
	h.mu.Lock()
	if h.subs[key] == nil {
		h.subs[key] = map[chan []byte]struct{}{}
	}
	h.subs[key][ch] = struct{}{}
	h.mu.Unlock()
	unsub := func() {
		h.mu.Lock()
		defer h.mu.Unlock()
		if set, ok := h.subs[key]; ok {
			delete(set, ch)
			if len(set) == 0 {
				delete(h.subs, key)
			}
		}
		close(ch)
	}
	return ch, unsub
}

// Publish sends payload to every subscriber of key. Slow subscribers are
// skipped (drop-on-full) rather than blocking the publisher.
func (h *Hub) Publish(key string, payload []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for ch := range h.subs[key] {
		select {
		case ch <- payload:
		default:
		}
	}
}

// SubscriberCount is handy for health metrics.
func (h *Hub) SubscriberCount(key string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.subs[key])
}
