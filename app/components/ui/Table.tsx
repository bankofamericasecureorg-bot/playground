interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  onRowClick?: (item: T) => void;
}

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  striped = true,
  hoverable = true,
  compact = false,
  onRowClick,
}: TableProps<T>) {
  const getNestedValue = (obj: T, path: string): unknown => {
    return path.split('.').reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === 'object' && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-10 bg-bofa-gray-200 rounded mb-2" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-bofa-gray-100 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-bofa-gray-50 border-b-2 border-bofa-gray-200">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`
                  px-4 ${compact ? 'py-2' : 'py-3'}
                  text-xs font-semibold text-bofa-gray-600 uppercase tracking-wider
                  ${alignClasses[column.align || 'left']}
                  ${column.className || ''}
                `}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length}
                className="px-4 py-12 text-center text-bofa-gray-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 text-bofa-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`
                  border-b border-bofa-gray-200
                  ${striped && index % 2 === 1 ? 'bg-bofa-gray-50' : 'bg-white'}
                  ${hoverable ? 'hover:bg-bofa-blue/5' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                  transition-colors
                `}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`
                      px-4 ${compact ? 'py-2' : 'py-4'}
                      text-sm text-bofa-gray-700
                      ${alignClasses[column.align || 'left']}
                      ${column.className || ''}
                    `}
                  >
                    {column.render 
                      ? column.render(item)
                      : String(getNestedValue(item, String(column.key)) ?? '-')
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Badge component for table cells
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    pending: 'bg-gray-100 text-gray-700',
    default: 'bg-bofa-gray-100 text-bofa-gray-700',
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full
      text-xs font-medium ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
}

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-bofa-gray-200">
      <div className="text-sm text-bofa-gray-600">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm border border-bofa-gray-300 rounded hover:bg-bofa-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              px-3 py-1.5 text-sm border rounded
              ${page === currentPage
                ? 'bg-bofa-navy text-white border-bofa-navy'
                : 'border-bofa-gray-300 hover:bg-bofa-gray-50'
              }
            `}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm border border-bofa-gray-300 rounded hover:bg-bofa-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
