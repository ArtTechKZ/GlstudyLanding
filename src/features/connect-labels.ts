import type {Translator} from '../i18n';
export const connectLabels=(t:Translator)=>({title:t('Connect.title'),close:t('StudyDialog.zakryt'),text:t('Connect.text')});
export type ConnectLabels=ReturnType<typeof connectLabels>;
