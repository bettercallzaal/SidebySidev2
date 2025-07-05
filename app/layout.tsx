import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import { ServiceWorkerRegistration } from './components/ServiceWorkerRegistration';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Force dynamic rendering to avoid hydration issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "ZAO Cypher Visualizer",
  description: "Experience the 30-artist ZAO Cypher with interactive visualization",
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  openGraph: {
    title: "ZAO Cypher Visualizer",
    description: "Experience the 30-artist ZAO Cypher with interactive visualization",
    images: ['/images/og-image.png'],
  },
  other: {
    "fc:miniapp:name": "ZAO Cypher",
    "fc:miniapp:description": "Interactive 30-artist cypher visualizer",
    "fc:miniapp:icon": "/icons/zao-icon-128.png",
    "fc:miniapp:embed": '{"action":"launch"}',
    "fc:miniapp:version": "1.0.0"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Initialize Service Worker */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful');
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
        
        {/* PostHog Analytics - Disabled to fix 401 errors */}
        {/* Uncomment and add your real PostHog key when ready for analytics
        <Script
          id="posthog-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('YOUR_REAL_API_KEY', { api_host: 'https://app.posthog.com' });
            `,
          }}
        />
        */}
        
        {/* Sentry Error Monitoring */}
        <Script
          id="sentry-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Placeholder for Sentry initialization
              // In production, this would include the actual Sentry SDK
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
