// Directus REST collection definitions; no secrets, users or fabricated records.
const field=(name,type='string',extra={})=>({field:name,type,meta:{interface:type==='boolean'?'boolean':type==='json'?'input-code':type==='text'?'input-multiline':'input',...(type==='boolean'?{special:['cast-boolean']}:{}),...extra.meta},schema:{...extra.schema}});
const localFields=['title_ru','title_kk','title_en','body_ru','body_kk','body_en'];
const definitions={
 cities:[field('slug'),field('name_ru'),field('name_kk'),field('name_en')],
 branches:[field('city'),field('name_ru'),field('address'),field('phone'),field('whatsapp'),field('schedule','json'),field('programs','json'),field('latitude','float'),field('longitude','float'),field('photos','json')],
 programs:[field('slug'),...localFields.map(n=>field(n,'text')),field('age_min','integer'),field('age_group'),field('format'),field('facts','json')],
 schedules:[field('branch'),field('program'),field('weekdays','json'),field('time_start'),field('duration_minutes','integer')],
 texts:[field('key'),...localFields.map(n=>field(n,'text'))],
 images:[field('file','uuid'),field('alt_ru'),field('alt_kk'),field('alt_en'),field('caption','text'),field('rights_confirmed','boolean')],
 trips:[field('slug'),...localFields.map(n=>field(n,'text')),field('date_start','date'),field('date_end','date'),field('age_min','integer'),field('included','json'),field('extra_costs','json'),field('itinerary','json'),field('accommodation','text'),field('supervision','text'),field('gallery','json')],
 faq:[field('category'),...localFields.map(n=>field(n,'text')),field('sort','integer')],
 teachers:[...localFields.map(n=>field(n,'text')),field('photo','uuid'),field('publication_consent','boolean')],
 reviews:[field('name'),field('city'),field('program'),...localFields.map(n=>field(n,'text')),field('photo','uuid'),field('publication_consent','boolean')],
 seo:[field('path'),field('locale'),field('title'),field('description','text'),field('canonical'),field('noindex','boolean'),field('og_image','uuid')],
 cta:[field('key'),...localFields.map(n=>field(n,'text')),field('href'),field('program')],
 documents:[field('kind'),field('locale'),field('file','uuid'),field('version'),field('operator_approved','boolean'),field('approved_at','timestamp')],
 redirects:[field('source'),field('destination'),field('code','integer')],
 leads:[field('name'),field('phone'),field('city'),field('program'),field('payload','json'),field('consent_version'),field('receipt'),field('delivery_state')]
};
export const collections=Object.entries(definitions).map(([name,fields])=>({collection:'gl_'+name,schema:{},meta:{accountability:'all',versioning:name!=='leads',archive_field:'status',archive_value:'archived',unarchive_value:'draft',archive_app_filter:true,note:'GL Study: publish only verified/approved content'},fields:[{field:'id',type:'uuid',meta:{hidden:true,special:['uuid'],interface:'input'},schema:{is_primary_key:true,has_auto_increment:false}},field('status','string',{meta:{interface:'select-dropdown',options:{choices:['draft','published','archived'].map(value=>({text:value,value}))}},schema:{default_value:'draft',is_nullable:false}}),field('approved_ru','boolean',{schema:{default_value:false}}),field('approved_kk','boolean',{schema:{default_value:false}}),field('approved_en','boolean',{schema:{default_value:false}}),field('public_data','json'),field('approval_hash'),field('publish_at','timestamp'),field('unpublish_at','timestamp'),...fields]}));
export const rolePolicies={
 administrator:{admin_access:true,app_access:true,enforce_tfa:true},
 editor:{admin_access:false,app_access:true,enforce_tfa:true},
 'lead manager':{admin_access:false,app_access:true,enforce_tfa:true},
 'build service':{admin_access:false,app_access:false,enforce_tfa:false}
};
export function permissions(role){
 if(role==='administrator')return [];
 if(role==='build service')return collections.filter(c=>c.collection!=='gl_leads').map(c=>({collection:c.collection,action:'read',fields:c.fields.map(f=>f.field).filter(f=>!['private_notes','price'].includes(f)),permissions:{_and:[{status:{_eq:'published'}},{approved_ru:{_eq:true}}]},validation:{},presets:{}}));
 return collections.filter(c=>role==='lead manager'?c.collection==='gl_leads':c.collection!=='gl_leads').flatMap(c=>
 (role==='lead manager'?['read','update']:['read','create','update']).map(action=>({collection:c.collection,action,fields:role==='lead manager'?(action==='update'?['delivery_state']:['id','name','phone','city','program','receipt','delivery_state']):c.fields.map(f=>f.field).filter(f=>!f.startsWith('approved_')&&!['approval_hash','publish_at','unpublish_at','status'].includes(f)),permissions:{},validation:role==='editor'&&action!=='read'?{status:{_in:['draft','archived']}}:{},presets:action==='create'?{status:'draft'}:{}})));
}
export function assertPublishable(record,locale='ru'){
 if(record.status!=='published'||record['approved_'+locale]!==true)throw Error('Unapproved content');
 return record;
}

export const fileRelations=[['gl_images','file'],['gl_teachers','photo'],['gl_reviews','photo'],['gl_documents','file'],['gl_seo','og_image']].map(([collection,field])=>({collection,field,related_collection:'directus_files',schema:{on_delete:'SET NULL'},meta:{many_collection:collection,many_field:field,one_collection:'directus_files',one_deselect_action:'nullify'}}));
