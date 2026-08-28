// Public SDK surface. Internal files (api/client, context internals, etc.) are
// intentionally not exported — storefronts should never import from
// "@merchforge/storefront-sdk/src/...".

export { MerchForgeProvider } from "./context/MerchForgeProvider";
export type { MerchForgeProviderProps } from "./context/MerchForgeProvider";
export type { MerchForgeConfig } from "./context/MerchForgeContext";

export { useBusiness } from "./hooks/useBusiness";
export { useProducts } from "./hooks/useProducts";
export { useProduct } from "./hooks/useProduct";
export { useRelatedProducts } from "./hooks/useRelatedProducts";
export { useCategories } from "./hooks/useCategories";
export { useCreateOrder } from "./hooks/useCreateOrder";
export { useOrder } from "./hooks/useOrder";

export { useCustomerAuth } from "./hooks/useCustomerAuth";
export type { UseCustomerAuthResult } from "./hooks/useCustomerAuth";
export { useCustomerProfile } from "./hooks/useCustomerProfile";
export { useUpdateCustomerProfile } from "./hooks/useUpdateCustomerProfile";

export type { Business } from "./types/business";
export type { Domain } from "./types/domain";
export type {
    Product,
    ProductDetail,
    ProductCategory,
    ProductImage,
    ProductMetadata,
    ProductsQuery,
    ProductSortField,
} from "./types/product";
export type { Category } from "./types/category";
export type { PagedResult, PagedQuery } from "./types/pagination";
export type {
    Order,
    OrderItem,
    OrderStatus,
    PaymentStatus,
    CreateOrderInput,
    CreateOrderItemInput,
} from "./types/order";
export type {
    Customer,
    CustomerProfile,
    UpdateCustomerProfileInput,
} from "./types/customer";

export {
    getMainImage,
    getGalleryImages,
    getDiscountPercent,
    getStockStatus,
    isSaleActive,
    getMetadataValue,
    resolveImageUrl,
} from "./adapters/productView";
export type { StockStatus } from "./adapters/productView";

export { MerchForgeApiError } from "./errors/MerchForgeApiError";
export type {
    MerchForgeApiErrorDetails,
    MerchForgeErrorType,
} from "./errors/MerchForgeApiError";
