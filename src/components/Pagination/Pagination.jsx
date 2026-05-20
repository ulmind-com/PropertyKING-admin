import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={16} />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="page-info">…</span>
        ) : (
          <button key={p} className={page === p ? 'active' : ''} onClick={() => onPageChange(p)}>
            {p}
          </button>
        )
      )}
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
