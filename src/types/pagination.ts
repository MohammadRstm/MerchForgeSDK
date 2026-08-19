export interface PagedResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface PagedQuery {
    page?: number;
    pageSize?: number;
}
