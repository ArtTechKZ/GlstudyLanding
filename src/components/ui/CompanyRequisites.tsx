import {useUi} from '../../i18n';
import {useCopy} from '../../i18n/copy';
import {COMPANY_REQUISITES} from '../../data/requisites';

export default function CompanyRequisites(){
  const t=useUi(),copy=useCopy(),r=COMPANY_REQUISITES;
  return <section className="study-panel company-requisites" id="requisites" aria-labelledby="requisites-title" data-requisites>
    <h2 id="requisites-title">{t('Legal.requisitesTitle')}</h2>
    <dl>
      <dt>{t('Legal.requisitesName')}</dt><dd lang="ru">{r.name}</dd>
      <dt>{t('Legal.requisitesBin')}</dt><dd className="study-phone-number">{r.bin}</dd>
      <dt>{t('Legal.requisitesDirector')}</dt><dd lang="ru">{r.director}</dd>
      <dt>{t('Legal.requisitesKato')}</dt><dd className="study-phone-number">{r.kato}</dd>
      <dt>{copy('Юридический адрес')}</dt><dd lang="ru">{r.legalAddress}</dd>
      <dt>{copy('Электронная почта')}</dt><dd><a href={`mailto:${r.email}`}>{r.email}</a></dd>
      <dt>{copy('Телефон')}</dt><dd><a className="study-phone-number" href={r.phoneHref}>{r.phone}</a></dd>
    </dl>
    <p>{t('Legal.requisitesSource')}</p>
  </section>;
}
