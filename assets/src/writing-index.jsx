import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

function SearchField({ value, onChange, inputRef }) {
  return (
    <label className="writing-search">
      <span className="sr-only">Search writing</span>
      <span className="writing-search-mark" aria-hidden="true">/</span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="search writing"
        autoComplete="off"
        spellCheck="false"
        aria-label="Search writing"
      />
    </label>
  );
}

function SortToggle({ direction, onToggle }) {
  const next = direction === 'newest' ? 'oldest' : 'newest';
  return (
    <button
      className="writing-sort"
      type="button"
      onClick={onToggle}
      title={`Sort ${next} first`}
      aria-label={`Sort ${next} first`}
    >
      {direction}<span aria-hidden="true">{direction === 'newest' ? ' ↓' : ' ↑'}</span>
    </button>
  );
}

function WritingRow({ item }) {
  return (
    <li className="post-list-item">
      <a className="post-list-link" href={item.url}>
        <time className="post-list-date" dateTime={item.date}>{item.displayDate}</time>
        <div className="post-list-copy">
          <h3 className="post-list-title">{item.title}</h3>
          <p className="post-list-excerpt">{item.subtitle}</p>
        </div>
        {item.readingTime ? <span className="post-list-length">{item.readingTime}</span> : null}
      </a>
    </li>
  );
}

function WritingIndex({ items }) {
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState('newest');
  const inputRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add('react-ready');
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const filtered = needle
      ? items.filter((item) => `${item.title} ${item.subtitle} ${item.author}`.toLocaleLowerCase().includes(needle))
      : items.slice();
    filtered.sort((a, b) => direction === 'newest'
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date));
    return filtered;
  }, [items, query, direction]);

  return (
    <>
      <div className="writing-controls">
        <SearchField value={query} onChange={setQuery} inputRef={inputRef} />
        <div className="writing-controls-meta">
          <span className="writing-count" aria-live="polite">{visible.length}/{items.length}</span>
          <SortToggle
            direction={direction}
            onToggle={() => setDirection((current) => current === 'newest' ? 'oldest' : 'newest')}
          />
        </div>
      </div>
      {visible.length ? (
        <ol className="post-list">
          {visible.map((item) => <WritingRow item={item} key={item.url} />)}
        </ol>
      ) : (
        <div className="writing-empty" role="status">
          <p>Nothing here matches “{query}”.</p>
        </div>
      )}
    </>
  );
}

const root = document.querySelector('#writing-index-root');
const data = document.querySelector('#writing-index-data');
if (root && data) {
  try {
    const items = JSON.parse(data.textContent || '[]');
    if (Array.isArray(items)) createRoot(root).render(<WritingIndex items={items} />);
  } catch (error) {
    console.warn('Writing index enhancement unavailable.', error);
  }
}
