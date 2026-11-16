const Disclaimer = () => {
  return (
    <div
      role="note"
      className="w-full border-b border-warning-200 bg-warning-25 px-4 py-1.5 text-center text-theme-xs text-warning-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 lg:text-sm"
    >
      <span aria-hidden>⚠ </span>
      Investments are subject to market risks. Read the offer document
      carefully before applying.
    </div>
  );
};

export default Disclaimer;
