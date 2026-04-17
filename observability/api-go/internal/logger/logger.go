package logger

import (
	"log/slog"
	"os"
)

// New returns a slog.Logger. JSON in prod, text (human) in dev.
func New(dev bool) *slog.Logger {
	opts := &slog.HandlerOptions{Level: slog.LevelInfo, AddSource: false}
	if dev {
		return slog.New(slog.NewTextHandler(os.Stdout, opts))
	}
	return slog.New(slog.NewJSONHandler(os.Stdout, opts))
}
