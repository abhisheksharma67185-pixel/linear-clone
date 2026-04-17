package clusters

import "math"

// cosineSimilarity computes the cosine similarity between two vectors.
// Returns a value in [-1, 1], where 1 means identical direction.
func cosineSimilarity(a, b []float32) float64 {
	if len(a) != len(b) || len(a) == 0 {
		return 0
	}
	var dot, normA, normB float64
	for i := range a {
		ai, bi := float64(a[i]), float64(b[i])
		dot += ai * bi
		normA += ai * ai
		normB += bi * bi
	}
	denom := math.Sqrt(normA) * math.Sqrt(normB)
	if denom == 0 {
		return 0
	}
	return dot / denom
}

// cosineDistance returns 1 - cosineSimilarity, so 0 = identical.
func cosineDistance(a, b []float32) float64 {
	return 1 - cosineSimilarity(a, b)
}

// addVectors returns element-wise a + b.
func addVectors(a, b []float32) []float32 {
	if len(a) != len(b) {
		return a
	}
	out := make([]float32, len(a))
	for i := range a {
		out[i] = a[i] + b[i]
	}
	return out
}

// scaleVector returns v * s element-wise.
func scaleVector(v []float32, s float32) []float32 {
	out := make([]float32, len(v))
	for i := range v {
		out[i] = v[i] * s
	}
	return out
}

// normalizeVector returns v / ||v||.
func normalizeVector(v []float32) []float32 {
	var norm float64
	for _, f := range v {
		norm += float64(f) * float64(f)
	}
	norm = math.Sqrt(norm)
	if norm == 0 {
		return v
	}
	return scaleVector(v, float32(1.0/norm))
}

// kMeans performs k-means clustering using cosine distance.
// Returns assignments (cluster index per data point) and the k centroids.
// If k > len(data), k is clamped to len(data).
func kMeans(data [][]float32, k, maxIter int) ([]int, [][]float32) {
	n := len(data)
	if n == 0 {
		return nil, nil
	}
	if k <= 0 {
		k = 1
	}
	if k > n {
		k = n
	}

	dim := len(data[0])
	assignments := make([]int, n)

	// Initialize centroids by picking k evenly-spaced points.
	centroids := make([][]float32, k)
	for i := 0; i < k; i++ {
		idx := i * n / k
		centroids[i] = normalizeVector(append([]float32(nil), data[idx]...))
	}

	for iter := 0; iter < maxIter; iter++ {
		changed := false

		// Assign each point to the nearest centroid (cosine distance).
		for i, vec := range data {
			bestCluster := 0
			bestDist := math.MaxFloat64
			for c := 0; c < k; c++ {
				d := cosineDistance(vec, centroids[c])
				if d < bestDist {
					bestDist = d
					bestCluster = c
				}
			}
			if assignments[i] != bestCluster {
				assignments[i] = bestCluster
				changed = true
			}
		}

		if !changed {
			break
		}

		// Recompute centroids.
		newCentroids := make([][]float32, k)
		counts := make([]int, k)
		for c := 0; c < k; c++ {
			newCentroids[c] = make([]float32, dim)
		}
		for i, vec := range data {
			c := assignments[i]
			newCentroids[c] = addVectors(newCentroids[c], vec)
			counts[c]++
		}
		for c := 0; c < k; c++ {
			if counts[c] > 0 {
				centroids[c] = normalizeVector(newCentroids[c])
			}
		}
	}

	return assignments, centroids
}
