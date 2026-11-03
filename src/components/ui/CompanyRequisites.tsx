import {useUi} from '../../i18n';
import {COMPANY_REQUISITES} from '../../data/requisites';

export default function CompanyRequisites(){
  const t=useUi(),r=COMPANY_REQUISITES;
  return <section className="study-panel company-requisites" id="requisites" aria-labelledby="requisites-title" data-requisites>
    <h2 id="requisites-title">{t('Legal.requisitesTitle')}</h2>
    <dl>
      <dt>{t('Legal.requisitesName')}</dt><dd lang="ru">{r.name}</dd>
      <dt>{t('Legal.requisitesBin')}</dt><dd className="study-phone-number">{r.bin}</dd>
      <dt>{t('Legal.requisitesDirector')}</dt><dd lang="ru">{r.director}</dd>
      <dt>{t('Legal.requisitesKato')}</dt><dd className="study-phone-number">{r.kato}</dd>
    </dl>
    <p>{t('Legal.requisitesSource')}</p>
  </section>;
}
