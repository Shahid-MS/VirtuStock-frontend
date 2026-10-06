import apiClient from "@/API/ApiClient";
import { IPOInterface } from "@/Interface/IPO";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<IPOInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setQuery("");
        setResults([]);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchIPO = async (value: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/ipo/search`, {
        params: { query: value },
      });
      setResults(res.data);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchIPO(query);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  // Ctrl/Cmd + K focuses the search box. Search is mounted twice (header and
  // mobile sidebar), so only react when this instance is actually visible.
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        const input = inputRef.current;
        if (input && input.offsetParent !== null) {
          event.preventDefault();
          input.focus();
        }
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <div ref={searchWrapperRef}>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="relative">
          <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
            <svg
              className="fill-gray-500 dark:fill-gray-400"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                fill=""
              />
            </svg>
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQuery("");
                setResults([]);
                setActiveIndex(-1);
                inputRef.current?.blur();
                return;
              }
              if (!results.length) return;

              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((prev) =>
                  prev < results.length - 1 ? prev + 1 : 0
                );
              }

              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((prev) =>
                  prev > 0 ? prev - 1 : results.length - 1
                );
              }

              if (e.key === "Enter") {
                e.preventDefault();
                const selected =
                  activeIndex >= 0 ? results[activeIndex] : results[0];
                navigate(`/ipo/${selected.id}`);
                setResults([]);
                setQuery("");
                setActiveIndex(-1);
              }
            }}
            type="text"
            placeholder="Search IPO by name or symbol"
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
          />

          <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
            <span> ⌘ </span>
            <span> K </span>
          </button>
        </div>
      </form>
      {query && (
        <div className="absolute z-50 mt-2 w-3/4 lg:w-1/2 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {loading && (
            <p className="px-4 py-2 text-sm text-gray-500">Searching...</p>
          )}

          {!loading && results.length === 0 && (
            <p className="px-4 py-2 text-sm text-gray-500">No results found</p>
          )}

          {results.map((item, index) => (
            <div
              key={item.id}
              className={`cursor-pointer px-4 py-2 text-sm 
      ${
        index === activeIndex
          ? "bg-gray-100 dark:bg-white/10"
          : "hover:bg-gray-100 dark:hover:bg-white/5"
      }
    `}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                navigate(`/ipo/${item.id}`);
                setResults([]);
                setQuery("");

                setActiveIndex(-1);
              }}
            >
              <p className="font-medium dark:text-white/90">{item.name}</p>
              <p className="text-xs text-gray-800 dark:text-white/50">{item.symbol}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
