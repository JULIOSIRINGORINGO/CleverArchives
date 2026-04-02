import '../globals.css';
import { GeistSans } from 'geist/font/sans';
import { Caveat } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ToastProvider } from '@/components/ui/Toast';
import { SWRProvider } from '@/providers/SWRProvider';

/* Removed Caveat Google Font to support offline development */
const caveatVariable = '--font-caveat';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${GeistSans.className} ${caveatVariable} antialiased font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <ToastProvider>
                  <CartProvider>
                    <CheckoutProvider>
                      <SWRProvider>
                        {children}
                      </SWRProvider>
                    </CheckoutProvider>
                  </CartProvider>
                </ToastProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
