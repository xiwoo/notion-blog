import type { Metadata } from "next";
import { Inter } from 'next/font/google';

import Script from 'next/script'
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google'

import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar"

import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Notion Blog',
  description: 'A blog powered by Notion and Next.js',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  
  return (
    <html lang="en">
      {/* { gaMeasurementId && <GoogleTagManager gtmId={gaMeasurementId} /> } */}

      <head>
        {/* GA4 추적 스크립트 추가 */}
        {gaMeasurementId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <Script
              id="google-analytics-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaMeasurementId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>

        <SidebarProvider>

          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex w-full items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <div className="flex w-full gap-2 justify-end">
                  <Link href="https://github.com/your-github" target="_blank" rel="noopener noreferrer">
                    <FaGithub className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                  </Link>
                  <Link href="https://linkedin.com/in/your-linkedin" target="_blank" rel="noopener noreferrer">
                    <FaLinkedin className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                  </Link>
                </div>
              </div>
            </header>
      
            {/* 메인 콘텐츠 */}
            <main className="flex-1 p-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>

      {/* { gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} /> } */}
    </html>
  );
}
