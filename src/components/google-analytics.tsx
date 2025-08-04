"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

// --------------------------------------------------------------------------------
// 💡 TIP: You can find your GA_TRACKING_ID in your Google Analytics dashboard.
// It should look like "G-XXXXXXXXXX".
// For production, it's recommended to store this in an environment variable.
// Example: export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";
// --------------------------------------------------------------------------------
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";

/**
 * Sends a pageview event to Google Analytics.
 * This is automatically handled by the GoogleAnalytics component.
 * @param url - The URL of the page to track.
 */
const pageview = (url: string) => {
  if (typeof window.gtag === "function" && GA_TRACKING_ID) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

/**
 * Sends a custom event to Google Analytics.
 * @param eventName - The name of the event (e.g., 'card_click').
 * @param params - An object of event parameters.
 */
export const gtagEvent = (
  eventName: string,
  params: Record<string, string | number | boolean>
) => {
  if (typeof window.gtag === "function" && GA_TRACKING_ID) {
    window.gtag("event", eventName, params);
  }
};

/**
 * This component handles the Google Analytics script injection and automatically
 * tracks pageviews on client-side navigation.
 * It should be placed in the root layout of the application.
 */
const GoogleAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This useEffect handles pageviews for client-side navigation.
    // The initial pageview is fired by the script's `gtag('config', ...)` call.
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    pageview(url);
  }, [pathname, searchParams]);

  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
