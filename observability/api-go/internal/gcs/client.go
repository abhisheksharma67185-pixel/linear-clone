package gcs

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"google.golang.org/api/option"
)

// Client wraps cloud.google.com/go/storage with dev-mode (fake-gcs-server)
// and signed-URL helpers.
type Client struct {
	cli    *storage.Client
	bucket string
	// endpoint is set when we point at fake-gcs so signed-URL generation
	// rewrites the host properly.
	endpoint string
}

// New builds a storage client, optionally pointing at a custom endpoint.
// When endpoint is non-empty we disable auth (fake-gcs-server).
func New(ctx context.Context, bucket, endpoint string) (*Client, error) {
	var opts []option.ClientOption
	if endpoint != "" {
		opts = append(opts,
			option.WithEndpoint(endpoint),
			option.WithoutAuthentication(),
		)
	}
	cli, err := storage.NewClient(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("storage.NewClient: %w", err)
	}
	return &Client{cli: cli, bucket: bucket, endpoint: endpoint}, nil
}

func (c *Client) Close() error { return c.cli.Close() }

// Bucket returns the configured bucket name.
func (c *Client) Bucket() string { return c.bucket }

// Put streams r into the bucket at key. contentType may be empty.
func (c *Client) Put(ctx context.Context, key string, r io.Reader, contentType string) error {
	w := c.cli.Bucket(c.bucket).Object(key).NewWriter(ctx)
	if contentType != "" {
		w.ContentType = contentType
	}
	if _, err := io.Copy(w, r); err != nil {
		_ = w.Close()
		return fmt.Errorf("gcs put copy: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("gcs put close: %w", err)
	}
	return nil
}

// SignedPutURL returns a V4 signed URL for PUT. Falls back to a fake-gcs
// compatible direct URL when an endpoint override is configured (signing is
// unavailable without credentials there).
func (c *Client) SignedPutURL(ctx context.Context, key, contentType string, ttl time.Duration) (string, time.Time, error) {
	expires := time.Now().Add(ttl)
	if c.endpoint != "" {
		// Dev mode: fake-gcs accepts unauthenticated PUTs. Strip any
		// trailing /storage/v1/ from the configured endpoint so we don't
		// double up on the path.
		base := strings.TrimRight(c.endpoint, "/")
		base = strings.TrimSuffix(base, "/storage/v1")
		url := fmt.Sprintf("%s/upload/storage/v1/b/%s/o?uploadType=media&name=%s",
			base, c.bucket, key)
		return url, expires, nil
	}
	url, err := c.cli.Bucket(c.bucket).SignedURL(key, &storage.SignedURLOptions{
		Method:      "PUT",
		Expires:     expires,
		ContentType: contentType,
		Scheme:      storage.SigningSchemeV4,
	})
	if err != nil {
		return "", time.Time{}, fmt.Errorf("signed url: %w", err)
	}
	return url, expires, nil
}

// GSURI formats a gs://bucket/key URI.
func (c *Client) GSURI(key string) string { return fmt.Sprintf("gs://%s/%s", c.bucket, key) }

// Get streams an object back to the caller.
func (c *Client) Get(ctx context.Context, key string) (io.ReadCloser, error) {
	return c.cli.Bucket(c.bucket).Object(key).NewReader(ctx)
}
