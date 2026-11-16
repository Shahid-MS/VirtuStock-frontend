interface PaginationProps {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pageNumber,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
}) => {
  const MAX_VISIBLE_PAGES = 3;
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= MAX_VISIBLE_PAGES + 1) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const startPage = Math.max(1, pageNumber - 2);
    const endPage = Math.min(totalPages - 2, pageNumber + 2);

    pages.push(0);

    if (startPage > 1) pages.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 2) pages.push("...");

    pages.push(totalPages - 1);

    return pages;
  };

  const start = pageNumber * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalElements);
  return (
    <>
      <div className="flex items-center flex-col sm:flex-row  justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
        <div className="pb-3 sm:pb-0">
          <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
            Showing
            <span className="text-gray-800 dark:text-white/90 mx-1">
              {start}
            </span>
            to
            <span className="text-gray-800 dark:text-white/90 mx-1">{end}</span>
            of
            <span className="text-gray-800 dark:text-white/90 mx-1">
              {totalElements}
            </span>
          </span>
        </div>
        <div className="flex bg-gray-50 dark:sm:bg-transparent dark:bg-white/[0.03] sm:bg-transparent rounded-lg w-full sm:w-auto p-4 sm:p-0 items-center justify-between gap-2 sm:justify-normal">
          <button
            className="shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            disabled={pageNumber === 0}
            onClick={() => onPageChange(pageNumber - 1)}
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.58203 9.99868C2.58174 10.1909 2.6549 10.3833 2.80152 10.53L7.79818 15.5301C8.09097 15.8231 8.56584 15.8233 8.85883 15.5305C9.15183 15.2377 9.152 14.7629 8.85921 14.4699L5.13911 10.7472L16.6665 10.7472C17.0807 10.7472 17.4165 10.4114 17.4165 9.99715C17.4165 9.58294 17.0807 9.24715 16.6665 9.24715L5.14456 9.24715L8.85919 5.53016C9.15199 5.23717 9.15184 4.7623 8.85885 4.4695C8.56587 4.1767 8.09099 4.17685 7.79819 4.46984L2.84069 9.43049C2.68224 9.568 2.58203 9.77087 2.58203 9.99715C2.58203 9.99766 2.58203 9.99817 2.58203 9.99868Z"
              ></path>
            </svg>
          </button>
          <ul className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {getPageNumbers().map((page, index) => (
              <li key={index}>
                {page === "..." ? (
                  <span className="flex h-10 w-10 items-center justify-center text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium 
          ${
            pageNumber === page
              ? "bg-brand-500 text-white"
              : "text-gray-700 dark:text-gray-400 hover:bg-brand-500 hover:text-white"
          }`}
                  >
                    {page + 1}
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button
            className="shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            disabled={pageNumber + 1 === totalPages}
            onClick={() => onPageChange(pageNumber + 1)}
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.4165 9.9986C17.4168 10.1909 17.3437 10.3832 17.197 10.53L12.2004 15.5301C11.9076 15.8231 11.4327 15.8233 11.1397 15.5305C10.8467 15.2377 10.8465 14.7629 11.1393 14.4699L14.8594 10.7472L3.33203 10.7472C2.91782 10.7472 2.58203 10.4114 2.58203 9.99715C2.58203 9.58294 2.91782 9.24715 3.33203 9.24715L14.854 9.24715L11.1393 5.53016C10.8465 5.23717 10.8467 4.7623 11.1397 4.4695C11.4327 4.1767 11.9075 4.17685 12.2003 4.46984L17.1578 9.43049C17.3163 9.568 17.4165 9.77087 17.4165 9.99715C17.4165 9.99763 17.4165 9.99812 17.4165 9.9986Z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default Pagination;
