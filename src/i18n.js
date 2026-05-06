import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['fr', 'en', 'de'];
export const defaultLocale = 'fr';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  
  const validLocale = locales.includes(locale) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});
