import { useBusiness, useProducts, useCategories, MerchForgeApiError } from "@merchforge/storefront-sdk";

// This is an integration test, not a storefront UI. It only exists to prove the
// SDK's data flow works end to end: MerchForgeProvider -> hooks -> API client ->
// MerchForge API -> back into these plain, unstyled elements.
export default function App() {
    const { data: business, isLoading: businessLoading, isError: businessError, error: businessErr } = useBusiness();
    const { data: products, isLoading: productsLoading, isError: productsError, error: productsErr } = useProducts();
    const { data: categories } = useCategories();

    return (
        <main style={{ fontFamily: "sans-serif", padding: 24 }}>
            <h1>
                {businessLoading
                    ? "Loading business..."
                    : businessError
                        ? `Business error: ${describeError(businessErr)}`
                        : business?.name}
            </h1>

            {categories && categories.length > 0 && (
                <p>Categories: {categories.join(", ")}</p>
            )}

            <h2>Products</h2>
            <hr />

            {productsLoading ? (
                <p>Loading products...</p>
            ) : productsError ? (
                <p>Products error: {describeError(productsErr)}</p>
            ) : products && products.items.length > 0 ? (
                <ul>
                    {products.items.map((product) => (
                        <li key={product.id}>
                            {product.title} — ${product.price}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No products.</p>
            )}
        </main>
    );
}

function describeError(error: unknown): string {
    if (error instanceof MerchForgeApiError) {
        return `[${error.type}/${error.code}] ${error.message}`;
    }

    return "Unknown error";
}
