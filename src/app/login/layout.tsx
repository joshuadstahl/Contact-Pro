import Navbar from '../components/mainSections/navbar';
import "./globals.css";
import React from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.StrictMode>
        <div>{children}</div>
    </React.StrictMode>
  );
}
