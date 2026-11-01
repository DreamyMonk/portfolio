import type { Metadata } from 'next';
import { Archivo_Black, Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { profile } from '@/lib/data';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const display = Archivo_Black({ weight: '400', subsets: ['latin'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const serif = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: profile.tagline,
};

// Runs before paint so a saved "fun" preference (or ?mode=fun) doesn't flash the pro layout.
const modeScript = `(function(){try{var q=new URLSearchParams(location.search).get('mode');var m=(q==='fun'||q==='pro')?q:localStorage.getItem('mode');if(q)localStorage.setItem('mode',q);document.documentElement.dataset.mode=m==='fun'?'fun':'pro';}catch(e){document.documentElement.dataset.mode='pro';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable} ${mono.variable} ${serif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: modeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
