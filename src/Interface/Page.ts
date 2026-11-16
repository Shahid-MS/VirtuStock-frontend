/** Shape of the paged responses returned by the backend (Spring `Page`). */
export interface Page<T> {
  content?: T[];
  totalPages?: number;
  totalElements?: number;
  lastPage?: boolean;
}
