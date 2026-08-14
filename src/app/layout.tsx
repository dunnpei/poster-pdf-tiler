import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '海報與大圖分割列印工具 | Poster & PDF Tiler',
  description: '純前端上傳 PDF 與高解析圖片，自動依指定網格與重疊邊距分割為多頁 A4，輕鬆印出大尺寸海報看板。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
