import { locales } from '../i18n';
export const langStaticPaths = () => locales.map((lang) => ({ params: { lang } }));
