import { calculatorQuestions } from '../i18n/calculator-content';
import { useLanguage } from '../i18n/LanguageProvider';

export function CalculatorQuestions() {
  const { t } = useLanguage();
  return <section className="guide-section" aria-labelledby="questions-heading">
    <div className="guide-heading"><h2 id="questions-heading">{t('purificationQuestionsTitle')}</h2></div>
    <div className="question-list">{calculatorQuestions.map(({ question, answer }) =>
      <article key={question}><h3>{t(question)}</h3><p>{t(answer, { mode: t('pokemonCP') })}</p></article>,
    )}</div>
  </section>;
}
