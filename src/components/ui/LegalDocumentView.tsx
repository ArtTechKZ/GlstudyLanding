import type {ReactNode} from 'react';
import type {LegalDocument, LegalItem} from '../../data/legal-documents';

// Renders a client-supplied legal text without altering it. Texts are Russian only; no translation is implied.
function renderItems(document: LegalDocument, items: LegalItem[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let bullets: ReactNode[] = [];
  const flush = () => { if (bullets.length) { nodes.push(<ul key={'ul' + nodes.length}>{bullets}</ul>); bullets = []; } };
  items.forEach((item, index) => {
    const lead = item.lead ? <strong>{item.lead}</strong> : null;
    if (document.id === 'privacy' || (!item.lead && item.text)) {
      bullets.push(<li key={index}>{lead}{lead && ' '}{item.text}</li>);
      return;
    }
    flush();
    if (!item.text) nodes.push(<h4 key={index}>{item.lead}</h4>);
    else nodes.push(<p key={index}>{lead}{lead && ' '}{item.text}</p>);
  });
  flush();
  return nodes;
}

export default function LegalDocumentView({document, headingId}: {document: LegalDocument; headingId: string}) {
  return <article className="legal-document" lang="ru" data-legal-document={document.id} aria-labelledby={headingId}>
    <h2 id={headingId}>{document.title}</h2>
    {document.intro.map(text => <p key={text}>{text}</p>)}
    {document.sections.map(section => <section key={section.heading}>
      {section.heading && <h3>{section.heading}</h3>}
      {section.paragraphs?.map(text => <p key={text}>{text}</p>)}
      {section.items && renderItems(document, section.items)}
    </section>)}
  </article>;
}
