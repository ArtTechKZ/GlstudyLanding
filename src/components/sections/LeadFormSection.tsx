import {configuredLeadHandler,leadEnvironment} from '../../features/lead-environment';
import {parseLocalePath} from '../../config/locale-routes.js';
import {Link} from '../../i18n/Link';
import { useCopy } from '../../i18n/copy';
import { useUi } from "../../i18n/index";
import { leadRouting } from '../../features/lead-routing';
import { COMPANY, PLANNED_LANGUAGES, SUMMER_DESTINATIONS } from '../../data/company';
import Icon from '../ui/Icon';
import { sitePath } from '../../utils/sitePath';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import {useLocation} from 'react-router-dom';
import { useCityContext } from '../../hooks/useCityContext';
import { usePrivacy, safePath } from '../../features/privacy';
import { useLeads, validateLead, normalizePhone, leadFieldLabel, type LeadDraft, type LeadHandler, type LeadPayload } from '../../features/leads';
import BranchPicker from '../ui/BranchPicker';
import { DEMO_PROGRAMS, TRAVEL_PROGRAMS } from '../../data/demo';
import './LeadFormSection.scss';
import {getEarlyRuntime} from '../../features/early-runtime';
import {createLeadSubmission,type SubmissionStatus} from '../../features/lead-submission';
export default function LeadFormSection({ compact = false, handler = configuredLeadHandler }: { compact?: boolean; handler?: LeadHandler }) {
  const environment=handler.environment??leadEnvironment;
  const copy = useCopy();
  const t = useUi();
  const { cities, selectedCity, activeBranch, availablePrograms, selectCity } = useCityContext();
  const { draft, setDraft, request, submitRequested,consumeSubmit } = useLeads();
  const formRef=useRef<HTMLFormElement>(null),submittedEarly=useRef(false);
  useLayoutEffect(()=>getEarlyRuntime().registerForm(formRef.current!),[]);
  useEffect(()=>{if(compact&&submitRequested&&!submittedEarly.current){submittedEarly.current=true;consumeSubmit();formRef.current?.requestSubmit()}},[compact,submitRequested,consumeSubmit]);
  const { attribution, emit } = usePrivacy();
  const location = useLocation(), id = useId();
  const type = compact ? request.type : parseLocalePath(location.pathname).semanticPath.startsWith('/travel/') ? 'travel' : parseLocalePath(location.pathname).semanticPath.startsWith('/ielts') ? 'ielts' : 'main';
  const [errors, setErrors] = useState<Partial<Record<keyof LeadDraft, string>>>({});
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const validateCurrent=useCallback(()=>{
    const invalid = validateLead(draft, type, t);
    if (draft.program && !draft.program.startsWith('summer-') && !draft.program.startsWith('language-') && draft.program!=='admissions' && availablePrograms !== undefined && !availablePrograms.includes(draft.program)) invalid.program = t("LeadFormSection.utochnite.programmu.dlya.vybrannogo.filiala");
    return invalid;
  },[draft,type,t,availablePrograms]);
  const previousTranslation=useRef(t);
  useEffect(()=>{if(previousTranslation.current===t)return;previousTranslation.current=t;setErrors(old=>{const next=validateCurrent();return Object.fromEntries(Object.keys(old).filter(k=>next[k as keyof LeadDraft]).map(k=>[k,next[k as keyof LeadDraft]]))})},[t,validateCurrent]);
  const started = useRef(false);
  const eventContext = () => ({ program: draft.program || request.program || draft.travelProgram || undefined, cta: compact ? request.ctaId : 'inline-form', position: compact ? 'modal' : 'lead-form' });
  const submittedEvent=useRef(eventContext());
  const eventCallbacks=useRef({emit,eventContext});
  useLayoutEffect(()=>{eventCallbacks.current={emit,eventContext}});
  const submission=useRef<ReturnType<typeof createLeadSubmission>|null>(null);
  useLayoutEffect(()=>{
    const operation=createLeadSubmission(setStatus,()=>eventCallbacks.current.emit('submit_success',submittedEvent.current),()=>eventCallbacks.current.emit('submit_error',submittedEvent.current));
    submission.current=operation;
    return()=>operation.cancel();
  },[]);
  function change(key: keyof LeadDraft, value: string | boolean) { setDraft(d => ({ ...d, [key]: value })); setErrors(e => ({ ...e, [key]: undefined })); setStatus('idle'); }
  const field = (key: keyof LeadDraft, label: string, kind = 'text', options?: { value: string; label: string }[]) => {
    const required=key!=='preferredArea' && (type!=='travel'||!['ageGroup','program','format'].includes(key));
    return <div className="lead-form__field" key={key}>
    <label htmlFor={`${id}-${key}`} className="lead-form__label">{leadFieldLabel(copy(label),required)}</label>
    {options ? <select className="lead-form__select" id={`${id}-${key}`} name={key} disabled={status==='pending'} required={required} value={String(draft[key])} onChange={e => change(key, e.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${id}-${key}-error` : undefined}><option value="">{t("LeadFormSection.vybrat")}</option>{options.map(o => <option key={o.value} value={o.value}>{copy(o.label)}</option>)}</select>
      : <input className="lead-form__input" id={`${id}-${key}`} name={key} type={kind} required={required} inputMode={key==='phone'?'tel':key==='childAge'?'numeric':key==='targetScore'?'decimal':undefined} min={key==='childAge'?10:undefined} maxLength={key === 'phone' ? 30 : 100} value={String(draft[key])} onChange={e => change(key, e.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${id}-${key}-error` : undefined} autoComplete={key === 'name' ? 'name' : key === 'phone' ? 'tel' : 'off'} />}
    {errors[key] && <span className="lead-form__error" role="alert" id={`${id}-${key}-error`}>{copy(errors[key])}</span>}</div>;
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if(status==='pending')return;
    const invalid=validateCurrent();
    setErrors(invalid);
    if (Object.keys(invalid).length) { document.getElementById(`${id}-${Object.keys(invalid)[0]}`)?.focus(); return; }
    if (!draft.consent) return;
    const program=type==='travel'?draft.travelProgram:draft.program || (type==='ielts'?'ielts-prep':request.program);
    const context={...(compact?request:{type,ctaId:'inline-form',page:safePath(location.pathname)}),program,format:(draft.format||undefined) as LeadPayload['format'],...(program==='admissions'||program?.startsWith('summer-')?{intent:'international' as const}:program?.startsWith('language-')?{intent:'language-start' as const}:{})};
    const payload: LeadPayload = { routing: leadRouting(context,selectedCity.id,activeBranch?.id,context.format,draft.preferredArea), name: draft.name.trim(), phone: normalizePhone(draft.phone), cityId: selectedCity.id, branchId: activeBranch?.id, ageGroup: (draft.ageGroup || undefined) as LeadPayload['ageGroup'], program, format: (draft.format || undefined) as LeadPayload['format'], channel: (draft.channel || undefined) as LeadPayload['channel'], comment: draft.comment.trim(), consent: { given: true, version: '1.0-demo' }, context, attribution: getEarlyRuntime().consent.getSnapshot()?.advertising ? attribution : undefined,
      ...(type === 'ielts' ? { ielts: { currentLevel: draft.currentLevel, targetScore: draft.targetScore, examDate: draft.examDate } } : {}),
      ...(type === 'travel' ? { travel: { parentName: draft.parentName.trim(), childAge: Number(draft.childAge), program: draft.travelProgram } } : {}) };
    submittedEvent.current=eventContext();
    await submission.current!.submit(handler,payload);
  }
  return <section className={`lead-form section${compact ? ' lead-form--compact' : ''}`} id={compact ? undefined : 'lead-form'} aria-label={t("LeadFormSection.demonstratsionnaya.forma.zayavki")}>
    <div className="container"><div className="lead-form__layout">
      {!compact && <>
{/* Left poster column */}
          <div className="lead-form__poster">
            <div className="lead-form__tag">
              <span className="lead-form__tag-dot" aria-hidden="true" />{t("LeadFormSection.pervyy.shag.besplatno")}</div>

            <h2 className="lead-form__heading" id="lead-form-heading">{t("Lead.heading.first")}<br />
              <span className="lead-form__heading-brand">{t("Lead.heading.second")}</span>
              <br />{t("Lead.heading.third")}</h2>

            <p className="lead-form__poster-desc">{t("LeadFormSection.zapolni.formu.my.svyazhemsya.s")}</p>

            {/* Poster benefit bullets */}
            <div className="lead-form__benefits">
              <div className="lead-form__benefit-item">
                <img
                  src={sitePath('/images/home/brand-pin.webp')}
                  alt=""
                  className="lead-form__pin-icon"
                  width={18}
                  height={18}
                  aria-hidden="true"
                />
                <span>{t("LeadFormSection.testirovanie.urovnya.i.personalnye.rekomendatsii")}</span>
              </div>
              <div className="lead-form__benefit-item">
                <img
                  src={sitePath('/images/home/brand-pin.webp')}
                  alt=""
                  className="lead-form__pin-icon"
                  width={18}
                  height={18}
                  aria-hidden="true"
                />
                <span>{t("LeadFormSection.znakomstvo.s.prepodavatelem.i.metodikoy")}</span>
              </div>
              <div className="lead-form__benefit-item">
                <img
                  src={sitePath('/images/home/brand-pin.webp')}
                  alt=""
                  className="lead-form__pin-icon"
                  width={18}
                  height={18}
                  aria-hidden="true"
                />
                <span>{t("LeadFormSection.bez.obyazatelstv.vybor.formata.onlayn")}</span>
              </div>
            </div>

            <div className="lead-form__poster-city">
              <Icon name="location" size={18} />{t("LeadFormSection.vybrannyy.gorod")}{copy(selectedCity.name)}
            </div>

            <div className="lead-form__demo-note" role="note">
              <Icon name="alert" size={18} />{(environment==='demo'?t("LeadFormSection.demonstratsionnyy.rezhim.zayavki.ne.otpravlyayutsya"):t(environment==='local-integration'?'Lead.localOnly':'Lead.deliveryNotice'))}</div>
          </div>
      </>}
      <div className="lead-form__form-col"><form ref={formRef} method="dialog" onChangeCapture={() => { if (!started.current) { started.current = true; emit('form_start',eventContext()); } }} noValidate className="lead-form__form" onSubmit={submit} aria-label={t("LeadFormSection.forma.zayavki.na.besplatnyy.urok")} aria-busy={status === 'pending'}>
        <p className="lead-form__field--full">{(environment==='demo'?t("LeadFormSection.demo.dannye.ostayutsya.v.pamyati"):t(environment==='local-integration'?'Lead.localOnly':'Lead.deliveryNotice'))}</p>
        {(type==='travel'||request.intent==='international') && <p className="lead-form__field--full">{copy("По зарубежным программам: ")}<a href={COMPANY.internationalWhatsApp} target="_blank" rel="noreferrer">{copy("написать в WhatsApp")} <span className="study-phone-number">{copy(COMPANY.internationalPhone)}</span></a>{copy(". Переход выполняется по вашему нажатию, поля формы в ссылку не передаются.")}</p>}
        {copy(field('name', t("LeadFormSection.imya")))}{copy(field('phone', t("LeadFormSection.telefon"), 'tel'))}
        <div className="lead-form__field"><label className="lead-form__label" htmlFor={`${id}-city`}>{t("LeadFormSection.gorod")}</label><select className="lead-form__select" id={`${id}-city`} name="city" value={selectedCity.id} onChange={e => selectCity(e.target.value)}>{cities.map(c => <option key={c.id} value={c.id}>{copy(c.name)}</option>)}</select></div>
        <BranchPicker />
        {copy(field('preferredArea', 'Удобный район (необязательно)'))}
        <p className="lead-form__field--full">{copy("Укажите удобный район для офлайн-занятий. Расписание и группу подбирают с менеджером.")}</p>
        {copy(field('ageGroup', t("LeadFormSection.vozrast.uchenika"), 'text', [{ value: 'children', label: t("LeadFormSection.5.9.let") }, { value: 'teens', label: t("LeadFormSection.10.17.let") }, { value: 'adults', label: t("LeadFormSection.18.let") }]))}
        {copy(field('program', t("LeadFormSection.napravlenie"), 'text', DEMO_PROGRAMS.filter(p => p.published && (availablePrograms === undefined || availablePrograms.includes(p.slug))).map(p => ({ value: p.id, label: p.title })).concat(PLANNED_LANGUAGES.map(p=>({value:`language-${p.id}`,label:t('Lead.plannedLanguage',{language:copy(p.title)})})),SUMMER_DESTINATIONS.map(p=>({value:`summer-${p.id}`,label:t('Lead.summerProgram',{destination:copy(p.title)})})),[{value:'admissions',label:'Поступление за рубеж'}])))}
        {availablePrograms === undefined && <p className="lead-form__field--full">{t("LeadFormSection.dostupnost.programm.v.vybrannom.filiale")}</p>}
        {copy(field('format', t("LeadFormSection.format"), 'text', [{ value: 'online', label: t("LeadFormSection.onlayn") }, { value: 'offline', label: t("LeadFormSection.oflayn") }, { value: 'hybrid', label: t("LeadFormSection.onlayn.i.oflayn") }]))}
        {copy(field('channel', t("LeadFormSection.sposob.svyazi"), 'text', [{ value: 'phone', label: t("LeadFormSection.telefon.2") }, { value: 'whatsapp', label: 'WhatsApp' }]))}
        {type === 'ielts' && <>{copy(field('currentLevel', t("LeadFormSection.tekushchiy.uroven"), 'text', [{ value: 'Не знаю', label: t("LeadFormSection.ne.znayu") }, ...['A1', 'A2', 'B1', 'B2', 'C1'].map(x => ({ value: x, label: x }))]))}{copy(field('targetScore', t("LeadFormSection.zhelaemyy.ball.ielts")))}{copy(field('examDate', t("LeadFormSection.planiruemaya.data.ekzamena"), 'date'))}</>}
        {type === 'travel' && <>{copy(field('parentName', t("LeadFormSection.imya.roditelya")))}{copy(field('childAge', t("LeadFormSection.vozrast.rebyonka.8.18"), 'number'))}{copy(field('travelProgram', t("LeadFormSection.programma.poezdki"), 'text', TRAVEL_PROGRAMS.filter(p => p.published).map(p => ({ value: p.slug, label: p.title }))))}</>}
        <div className="lead-form__field lead-form__field--full"><label htmlFor={`${id}-comment`} className="lead-form__label">{t("LeadFormSection.kommentariy")}</label><textarea className="lead-form__textarea" rows={3} id={`${id}-comment`} name="comment" maxLength={1000} value={draft.comment} onChange={e => change('comment', e.target.value)} /></div>
        <div className="lead-form__field lead-form__field--full"><label className="lead-form__consent"><input id={`${id}-consent`} type="checkbox" name="consent" className="lead-form__consent-check" checked={draft.consent} onChange={e => change('consent', e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${id}-consent-error` : undefined} /><span className="lead-form__consent-text">{t('Lead.consentStatement',{processing:'{processing}',policy:'{policy}'}).split(/(\{processing\}|\{policy\})/).map((part,i)=>part==='{processing}'?<Link key={i} className="lead-form__consent-link" to="/personal-data-consent" target="_blank" rel="noreferrer">{t('LeadFormSection.obrabotku.personalnykh.dannykh')}</Link>:part==='{policy}'?<Link key={i} className="lead-form__consent-link" to="/privacy-policy" target="_blank" rel="noreferrer">{t('LeadFormSection.politikoy.konfidentsialnosti')}</Link>:part)}</span></label>{errors.consent && <span className="lead-form__error" id={`${id}-consent-error`} role="alert">{copy(errors.consent)}</span>}</div>
        <div className="lead-form__field lead-form__field--full"><button className="btn btn-primary lead-form__submit" type="submit" disabled={status === 'pending'}>{copy(status === 'pending' ? t("LeadFormSection.proveryaem") : (environment==='demo'?t("LeadFormSection.proverit.formu"):t('Lead.send')))}</button>{status==='accepted'&&<button type="button" className="study-button" onClick={()=>{if(submission.current?.newAttempt()){handler.newAttempt?.();setDraft(d=>({...d,consent:false}));}}}>{t('Lead.newAttempt')}</button>}<p role="status" className="study-form-status">{copy(status === 'queued' ? t('Lead.queued') : status === 'accepted' && environment==='local-integration' ? t('Lead.localDelivered') : status === 'demo' ? t("LeadFormSection.forma.korrektna.demonstratsionnyy.rezhim.dannye") : status === 'accepted' ? t("LeadFormSection.testovyy.obrabotchik.prinyal.dannye") : status === 'error' ? t("LeadFormSection.ne.udalos.obrabotat.formu.dannye") : '')}</p></div>
      </form></div>
    </div></div>
  </section>;
}
