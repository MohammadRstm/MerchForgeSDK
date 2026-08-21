import { useState } from "react";
import {
    useBusiness,
    useProducts,
    useProduct,
    useRelatedProducts,
    useCategories,
    MerchForgeApiError,
} from "@merchforge/storefront-sdk";

// This is an integration test, not a storefront UI. It exists to prove the SDK's
// data flow works end to end against a real MerchForge backend:
// MerchForgeProvider -> hooks -> API client -> MerchForge API -> these plain,
// unstyled elements. No styling or UX decisions belong here.
export default function App() {
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

    const business = useBusiness();
    const categories = useCategories();
    const products = useProducts({ categoryId, sortBy: "Price", sortDescending: false });

    return (
        <main style={{ fontFamily: "sans-serif", padding: 24, lineHeight: 1.5 }}>
            <h1>
                {business.isLoading
                    ? "Loading business..."
                    : business.isError
                        ? `Business error: ${describeError(business.error)}`
                        : business.data?.name}
            </h1>

            {business.data && (
                <p data-testid="store-config">
                    domain=<b>{business.data.domain?.slug ?? "(none)"}</b>{" "}
                    currency=<b>{business.data.currency}</b>{" "}
                    locale=<b>{business.data.locale}</b>
                </p>
            )}

            <h2>Categories</h2>
            {categories.isError ? (
                <p>Categories error: {describeError(categories.error)}</p>
            ) : (
                <div data-testid="categories">
                    <button onClick={() => setCategoryId(undefined)} disabled={!categoryId}>
                        All
                    </button>
                    {categories.data?.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setCategoryId(category.id)}
                            disabled={categoryId === category.id}
                        >
                            {category.name} ({category.productCount})
                        </button>
                    ))}
                </div>
            )}

            <h2>Products</h2>
            {products.isLoading ? (
                <p>Loading products...</p>
            ) : products.isError ? (
                <p>Products error: {describeError(products.error)}</p>
            ) : products.data && products.data.items.length > 0 ? (
                <ul data-testid="products">
                    {products.data.items.map((product) => (
                        <li key={product.id}>
                            <button onClick={() => setSelectedProductId(product.id)}>
                                {product.title}
                            </button>{" "}
                            — {product.price} — {product.category.name}
                            {product.metadata && (
                                <> — metadata: {JSON.stringify(product.metadata)}</>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No products.</p>
            )}

            {products.data && (
                <p data-testid="pagination">
                    page {products.data.page} of {products.data.totalPages} —{" "}
                    {products.data.totalCount} product(s)
                </p>
            )}

            {selectedProductId && <ProductDetail productId={selectedProductId} />}
        </main>
    );
}

function ProductDetail({ productId }: { productId: string }) {
    const product = useProduct(productId);
    const related = useRelatedProducts(productId, 4);

    if (product.isLoading) return <p>Loading product...</p>;
    if (product.isError) return <p>Product error: {describeError(product.error)}</p>;
    if (!product.data) return null;

    return (
        <section data-testid="product-detail">
            <h2>{product.data.title}</h2>
            <p>{product.data.description}</p>
            <p>
                {product.data.category.name} — {product.data.price}
            </p>
            <p>metadata: {JSON.stringify(product.data.metadata)}</p>

            <h3>Related</h3>
            {related.data && related.data.length > 0 ? (
                <ul data-testid="related">
                    {related.data.map((item) => (
                        <li key={item.id}>{item.title}</li>
                    ))}
                </ul>
            ) : (
                <p>No related products.</p>
            )}
        </section>
    );
}

function describeError(error: unknown): string {
    if (error instanceof MerchForgeApiError) {
        return `[${error.type}/${error.code}] ${error.message}`;
    }

    return "Unknown error";
}
