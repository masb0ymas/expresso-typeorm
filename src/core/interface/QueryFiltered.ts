export interface FilteredQueryEntity {
  id: string
  value: string
}

export interface SortedQueryEntity {
  sort: string
  order: 'ASC' | 'DESC'
}
