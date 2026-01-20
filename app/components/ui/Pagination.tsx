'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const startItem = totalItems ? (currentPage - 1) * (itemsPerPage || 10) + 1 : null;
  const endItem = totalItems ? Math.min(currentPage * (itemsPerPage || 10), totalItems) : null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#e5e7eb]">
      {/* Info */}
      <div className="text-[12px] text-[#666]">
        {totalItems && startItem && endItem ? (
          <span>Showing {startItem}-{endItem} of {totalItems}</span>
        ) : (
          <span>Page {currentPage} of {totalPages}</span>
        )}
      </div>
      
      {/* Page Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-[12px] text-[#666] hover:bg-[#f5f5f5] rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`min-w-[28px] h-7 text-[12px] rounded transition-colors ${
                currentPage === page
                  ? 'bg-[#012169] text-white'
                  : 'text-[#666] hover:bg-[#f5f5f5]'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-1 text-[12px] text-[#999]">{page}</span>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-[12px] text-[#666] hover:bg-[#f5f5f5] rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
