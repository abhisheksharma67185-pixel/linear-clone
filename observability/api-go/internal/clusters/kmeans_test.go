package clusters

import (
	"math"
	"testing"
)

func TestCosineSimilarity_IdenticalVectors(t *testing.T) {
	a := []float32{1, 2, 3}
	got := cosineSimilarity(a, a)
	if math.Abs(got-1.0) > 1e-6 {
		t.Errorf("cosineSimilarity(a, a) = %f, want 1.0", got)
	}
}

func TestCosineSimilarity_OrthogonalVectors(t *testing.T) {
	a := []float32{1, 0, 0}
	b := []float32{0, 1, 0}
	got := cosineSimilarity(a, b)
	if math.Abs(got) > 1e-6 {
		t.Errorf("cosineSimilarity(orthogonal) = %f, want 0.0", got)
	}
}

func TestCosineSimilarity_OppositeVectors(t *testing.T) {
	a := []float32{1, 0, 0}
	b := []float32{-1, 0, 0}
	got := cosineSimilarity(a, b)
	if math.Abs(got+1.0) > 1e-6 {
		t.Errorf("cosineSimilarity(opposite) = %f, want -1.0", got)
	}
}

func TestCosineDistance(t *testing.T) {
	a := []float32{1, 2, 3}
	got := cosineDistance(a, a)
	if math.Abs(got) > 1e-6 {
		t.Errorf("cosineDistance(a, a) = %f, want 0.0", got)
	}
}

func TestCosineDistance_Orthogonal(t *testing.T) {
	a := []float32{1, 0}
	b := []float32{0, 1}
	got := cosineDistance(a, b)
	if math.Abs(got-1.0) > 1e-6 {
		t.Errorf("cosineDistance(orthogonal) = %f, want 1.0", got)
	}
}

func TestCosineSimilarity_EmptyVectors(t *testing.T) {
	got := cosineSimilarity(nil, nil)
	if got != 0 {
		t.Errorf("cosineSimilarity(nil, nil) = %f, want 0.0", got)
	}
}

func TestCosineSimilarity_DifferentLengths(t *testing.T) {
	a := []float32{1, 2}
	b := []float32{1, 2, 3}
	got := cosineSimilarity(a, b)
	if got != 0 {
		t.Errorf("cosineSimilarity(diff len) = %f, want 0.0", got)
	}
}

func TestKMeans_ThreeObviousClusters(t *testing.T) {
	// 9 points in 3 obvious clusters in 2D.
	data := [][]float32{
		// Cluster A: pointing roughly in direction (1, 0)
		{10, 0.1},
		{10, -0.1},
		{10, 0},
		// Cluster B: pointing roughly in direction (0, 1)
		{0.1, 10},
		{-0.1, 10},
		{0, 10},
		// Cluster C: pointing roughly in direction (-1, -1)
		{-10, -10},
		{-10, -10.1},
		{-10.1, -10},
	}

	assignments, centroids := kMeans(data, 3, 50)

	if len(assignments) != 9 {
		t.Fatalf("expected 9 assignments, got %d", len(assignments))
	}
	if len(centroids) != 3 {
		t.Fatalf("expected 3 centroids, got %d", len(centroids))
	}

	// Points 0,1,2 should be in the same cluster.
	if assignments[0] != assignments[1] || assignments[1] != assignments[2] {
		t.Errorf("cluster A points not grouped: %v", assignments[:3])
	}
	// Points 3,4,5 should be in the same cluster.
	if assignments[3] != assignments[4] || assignments[4] != assignments[5] {
		t.Errorf("cluster B points not grouped: %v", assignments[3:6])
	}
	// Points 6,7,8 should be in the same cluster.
	if assignments[6] != assignments[7] || assignments[7] != assignments[8] {
		t.Errorf("cluster C points not grouped: %v", assignments[6:9])
	}

	// All three clusters should be different.
	if assignments[0] == assignments[3] || assignments[0] == assignments[6] || assignments[3] == assignments[6] {
		t.Errorf("clusters not distinct: A=%d B=%d C=%d", assignments[0], assignments[3], assignments[6])
	}
}

func TestKMeans_KGreaterThanN(t *testing.T) {
	data := [][]float32{
		{1, 0},
		{0, 1},
	}
	// k=10 but only 2 data points — should clamp and not panic.
	assignments, centroids := kMeans(data, 10, 50)
	if len(assignments) != 2 {
		t.Fatalf("expected 2 assignments, got %d", len(assignments))
	}
	if len(centroids) != 2 {
		t.Fatalf("expected 2 centroids (clamped), got %d", len(centroids))
	}
}

func TestKMeans_EmptyData(t *testing.T) {
	assignments, centroids := kMeans(nil, 3, 50)
	if assignments != nil {
		t.Errorf("expected nil assignments, got %v", assignments)
	}
	if centroids != nil {
		t.Errorf("expected nil centroids, got %v", centroids)
	}
}

func TestKMeans_SinglePoint(t *testing.T) {
	data := [][]float32{{1, 2, 3}}
	assignments, centroids := kMeans(data, 3, 50)
	if len(assignments) != 1 {
		t.Fatalf("expected 1 assignment, got %d", len(assignments))
	}
	if len(centroids) != 1 {
		t.Fatalf("expected 1 centroid (clamped), got %d", len(centroids))
	}
}

func TestNormalizeVector(t *testing.T) {
	v := normalizeVector([]float32{3, 4})
	norm := math.Sqrt(float64(v[0])*float64(v[0]) + float64(v[1])*float64(v[1]))
	if math.Abs(norm-1.0) > 1e-6 {
		t.Errorf("normalizeVector norm = %f, want 1.0", norm)
	}
}

func TestNormalizeVector_Zero(t *testing.T) {
	v := normalizeVector([]float32{0, 0, 0})
	for i, f := range v {
		if f != 0 {
			t.Errorf("normalizeVector(zero)[%d] = %f, want 0", i, f)
		}
	}
}

func TestAddVectors(t *testing.T) {
	a := []float32{1, 2, 3}
	b := []float32{4, 5, 6}
	got := addVectors(a, b)
	want := []float32{5, 7, 9}
	for i := range got {
		if got[i] != want[i] {
			t.Errorf("addVectors[%d] = %f, want %f", i, got[i], want[i])
		}
	}
}

func TestScaleVector(t *testing.T) {
	v := []float32{2, 4, 6}
	got := scaleVector(v, 0.5)
	want := []float32{1, 2, 3}
	for i := range got {
		if got[i] != want[i] {
			t.Errorf("scaleVector[%d] = %f, want %f", i, got[i], want[i])
		}
	}
}
