import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { languages } from '../i18n/language';
import type { Language } from '../i18n/language';
import type { MessageKey } from '../i18n/translate';
import { useLanguage } from '../i18n/LanguageProvider';

const countries: Record<Language, { label: MessageKey; flag: string }> = {
  en: { label: 'countryUK', flag: 'gb' },
  de: { label: 'countryGermany', flag: 'de' },
  it: { label: 'countryItaly', flag: 'it' },
  es: { label: 'countrySpain', flag: 'es' },
  fr: { label: 'countryFrance', flag: 'fr' },
  ja: { label: 'countryJapan', flag: 'jp' },
};

function Flag({ language }: { language: Language }) {
  return <img className="language-flag" src={`${import.meta.env.BASE_URL}assets/flags/${countries[language].flag}.svg`} alt="" width="24" height="18" />;
}

export function LanguageSelect() {
  const { language, setPreference, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const menuId = useId();
  const currentName = languages.find(({ code }) => code === language)!.name;
  const choices = languages.map(({ code, name }) => ({ value: code, language: code, label: t(countries[code].label), detail: name }));

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  function showMenu(index = choices.findIndex(({ value }) => value === language)) {
    setActiveIndex(index);
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function choose(value: Language) {
    setPreference(value);
    closeMenu();
  }

  function handleKeys(event: KeyboardEvent<HTMLUListElement>) {
    const lastIndex = choices.length - 1;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(choices[activeIndex].value);
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? lastIndex
        : (activeIndex + (event.key === 'ArrowDown' ? 1 : lastIndex)) % choices.length;
      setActiveIndex(next);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const key = event.key.toLocaleLowerCase();
      for (let offset = 1; offset <= choices.length; offset++) {
        const index = (activeIndex + offset) % choices.length;
        const choice = choices[index];
        if (choice.label.toLocaleLowerCase().startsWith(key) || choice.detail.toLocaleLowerCase().startsWith(key)) {
          event.preventDefault();
          setActiveIndex(index);
          break;
        }
      }
    }
  }

  return <div className="language-select" ref={rootRef} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button type="button" className="language-trigger" ref={buttonRef}
      aria-label={`${t('language')}: ${currentName}`}
      aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? menuId : undefined}
      onClick={() => open ? closeMenu() : showMenu()} onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          showMenu(event.key === 'ArrowUp' ? choices.length - 1 : undefined);
        }
      }}>
      <Flag language={language} />
      <span className="language-trigger-name">{currentName}</span>
      <ChevronDown className="language-trigger-chevron" size={14} aria-hidden="true" />
    </button>
    {open && <ul className="language-menu" id={menuId} role="listbox" aria-label={t('language')} onKeyDown={handleKeys}>
      {choices.map((choice, index) => <li className="language-option" key={choice.value} role="option"
        aria-selected={language === choice.value} tabIndex={index === activeIndex ? 0 : -1}
        ref={(element) => { optionRefs.current[index] = element; }} onFocus={() => setActiveIndex(index)}
        onClick={() => choose(choice.value)}>
        <Flag language={choice.language} />
        <span className="language-option-text"><span>{choice.label}</span>{choice.detail && <span className="language-option-detail" lang={choice.language}>{choice.detail}</span>}</span>
        {language === choice.value && <Check size={16} aria-hidden="true" />}
      </li>)}
    </ul>}
  </div>;
}
