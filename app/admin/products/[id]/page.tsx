"use client";

import { Spinner } from "@shopify/polaris";
import { useEffect, useState, use } from "react";
import ProductForm from "../_components/ProductForm";
import type { Product } from "../../../lib/mock-data";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/data/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading || !product) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spinner size="large" />
      </div>
    );
  }

  return <ProductForm product={product} />;
}
