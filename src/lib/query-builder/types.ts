import { DataSourceOptions, ObjectLiteral, SelectQueryBuilder } from 'typeorm'

export type CalculatePageSizeParams = {
  pageSize: number
  limit: number
}

export type ApplyPaginationParams<T extends ObjectLiteral> = {
  query: SelectQueryBuilder<T>
  page: number
  pageSize: number
  limit?: number
}

export type ApplyFilterParams<T extends ObjectLiteral> = {
  query: SelectQueryBuilder<T>
  filters: any
  model: string
  options?: DataSourceOptions
}

export type QueryFilters = {
  id: string
  value: string
}

export type ApplySortParams<T extends ObjectLiteral> = {
  query: SelectQueryBuilder<T>
  sorts: any
  model: string
  orderKey?: string
}

export type QuerySorts = {
  sort: string
  order: 'ASC' | 'DESC'
}

type RequestQuery = {
  filtered?: QueryFilters[]
  sorted?: QuerySorts[]
  page?: string | number
  pageSize?: string | number
  [key: string]: any
}

type QueryOptions = {
  limit?: number
  orderKey?: string
}

export type QueryParams<T extends ObjectLiteral> = {
  model: string
  query: SelectQueryBuilder<T>
  reqQuery: RequestQuery
  options?: QueryOptions
}

export type QueryBuilderParams<T extends ObjectLiteral> = {
  params: QueryParams<T>
  options?: DataSourceOptions
}
