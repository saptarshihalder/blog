import React, { useEffect, useMemo, useRef, useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';

const h = React.createElement;

function SearchField({ value, onChange, inputRef }) {
  return h(
    'label',
    { className: 'writing-search' },
    h('span', { className: 'sr-only' }, 'Search writing'),
    h('span', { className: 'writing-search-mark', 'aria-hidden': 'true' }, '/'),
    h('input', {
      ref: inputRef,
      type: 'search',
      value,
      onChange: (event) => onChange(event.target.value),
      placeholder: 'search writing',
      autoComplete: 'off',
      spellCheck: 'false',
      'aria-label': 'Search writing'
    })
  );
}

function SortToggle({ direction, onToggle }) {
  const next = direction === 'newest' ? 'oldest' : 'newest';
  return h(
    'button',
    {
      className: 'writing-sort',
      type: 'button',
      onClick: onToggle,
      title: `Sort ${next} first`,
      'aria-label': `Sort ${next} first`
    },
    direction,
    h('span', { 'aria-hidden': 'true' }, direction === 'newest' ? ' ↓' : ' ↑')
  );
}

function WritingRow({ item }) {
  return h(
    'li',
    { className: 'post-list-item' },
    h(
      'a',
      { className: 'post-list-link', href: item.url },
      h('time', { className: 'post-list-date', dateTime: item.date }, item.displayDate),
      h(
        'div',
        { className: 'post-list-copy' },
        h('h3', { className: 'post-list-title' }, item.title),
        h('p', { className: 'post-list-excerpt' }, item.subtitle)
      ),
      item.readingTime ? h('span', { className: 'post-list-length' }, item.readingTime) : null
    )
  );
}

function EmptyState({ query }) {
  return h(
    'div',
    { className: 'writing-empty', role: 'status' },
    h('p', null, `Nothing here matches “${query}”.`)
  );
}

function WritingIndex({ items }) {
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState('newest');
  const inputRef = useRef(null);

  useEffect(() => {
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

  return h(
    React.Fragment,
    null,
    h(
      'div',
      { className: 'writing-controls' },
      h(SearchField, { value: query, onChange: setQuery, inputRef }),
      h(
        'div',
        { className: 'writing-controls-meta' },
        h('span', { className: 'writing-count', 'aria-live': 'polite' }, `${visible.length}/${items.length}`),
        h(SortToggle, {
          direction,
          onToggle: () => setDirection((current) => current === 'newest' ? 'oldest' : 'newest')
        })
      )
    ),
    visible.length
      ? h('ol', { className: 'post-list' }, visible.map((item) => h(WritingRow, { item, key: item.url })))
      : h(EmptyState, { query })
  );
}

const root = document.querySelector('#writing-index-root');
const data = document.querySelector('#writing-index-data');

if (root && data) {
  try {
    const items = JSON.parse(data.textContent || '[]');
    if (Array.isArray(items)) createRoot(root).render(h(WritingIndex, { items }));
  } catch (error) {
    console.warn('Writing index enhancement unavailable.', error);
  }
}
