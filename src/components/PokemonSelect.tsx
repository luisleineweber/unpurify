import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import type { Species } from '../lib/pokemon';
import { useLanguage } from '../i18n/LanguageProvider';
import { speciesName } from '../i18n/species';

type Props = {
  species: Species[];
  value: string;
  invalid: boolean;
  onChange: (value: string) => void;
};

export function PokemonSelect({ species, value, invalid, onChange }: Props) {
  const { t, language, number } = useLanguage();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const entries = useMemo(() => species.map((entry) => ({ species: entry, name: speciesName(entry, language) }))
    .sort((a, b) => a.name.localeCompare(b.name, language)), [species, language]);
  const options = useMemo(() => {
    const search = query.trim().normalize('NFKC').toLocaleLowerCase(language);
    return entries.filter((entry) => entry.name.normalize('NFKC').toLocaleLowerCase(language).includes(search));
  }, [query, entries, language]);
  const active = options[activeIndex];

  useEffect(() => { setOpen(false); setQuery(''); setActiveIndex(-1); }, [language]);

  useEffect(() => {
    if (open && active) {
      document.getElementById(`${listId}-${active.species.id}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, active, listId]);

  function browse() {
    setQuery('');
    setActiveIndex(entries.findIndex((entry) => entry.name === value));
    setOpen(true);
  }

  function choose(entry: typeof entries[number]) {
    onChange(entry.name);
    setOpen(false);
    setActiveIndex(-1);
  }

  return <div className="form-field pokemon-select" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <label htmlFor="pokemon-search">{t('pokemon')}</label>
    <div className="search-field">
      <Search size={17} aria-hidden="true" />
      <input ref={inputRef} id="pokemon-search" type="text" role="combobox" value={value}
        autoComplete="off" spellCheck={false} placeholder={t('searchPokemon')}
        aria-autocomplete="list" aria-expanded={open} aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active ? `${listId}-${active.species.id}` : undefined}
        aria-invalid={invalid} aria-describedby={invalid ? 'species-help advanced-error' : 'species-help'}
        onFocus={(event) => { event.currentTarget.select(); browse(); }}
        onClick={() => { if (!open) browse(); }}
        onChange={(event) => {
          onChange(event.target.value);
          setQuery(event.target.value);
          setActiveIndex(-1);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            setActiveIndex((index) => index === -1
              ? direction === 1 ? 0 : options.length - 1
              : Math.max(0, Math.min(options.length - 1, index + direction)));
          } else if (event.key === 'Enter' && open && active) {
            event.preventDefault();
            choose(active);
          } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            setOpen(false);
          } else if (event.key === 'Enter' || event.key === 'Tab') {
            setOpen(false);
          }
        }} />
      <button type="button" className="pokemon-list-toggle" tabIndex={-1}
        aria-label={t(open ? 'closePokemon' : 'openPokemon')}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          const wasOpen = open;
          inputRef.current?.focus();
          if (wasOpen) setOpen(false);
          else browse();
        }}><ChevronDown size={18} aria-hidden="true" /></button>
    </div>
    {open && <div className="pokemon-dropdown">
      <div className="pokemon-dropdown-heading"><span>{t('choosePokemon')}</span><span>{t('pokemonMatches', { count: number(options.length) })}</span></div>
      <ul id={listId} className="pokemon-options" role="listbox" aria-label={t('pokemon')}>
        {options.map((entry, index) => <li key={entry.species.id} id={`${listId}-${entry.species.id}`}
          role="option" aria-selected={index === activeIndex}
          className={`pokemon-option ${entry.name === value ? 'pokemon-option-chosen' : ''}`}
          onMouseDown={(event) => event.preventDefault()}
          onMouseMove={() => setActiveIndex(index)} onClick={() => choose(entry)}>
          <span className="pokemon-option-dex">#{entry.species.dex.toString().padStart(3, '0')}</span>
          <span className="pokemon-option-name">{entry.name}</span>
          {entry.name === value && <Check size={16} aria-hidden="true" />}
        </li>)}
      </ul>
      {options.length === 0 && <p className="pokemon-no-match" role="status">{t('noPokemon')}</p>}
    </div>}
  </div>;
}
