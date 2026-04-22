"use client";

import { Spinner, Box, InlineStack } from "@shopify/polaris";
import { useEffect, useState, use } from "react";
import ProductForm from "../_components/ProductForm";
import type { Product } from "../../../lib/mock-data";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/data/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading || !product) {
    return (
      <Box padding="1000">
        <InlineStack align="center">
          <Spinner size="large" />
        </InlineStack>
      </Box>
    );
  }

  return <ProductForm product={product} />;
}
