
'use client';

import { useEffect, useState } from 'react';
import SplashScreen from '@/components/splash-screen';
import PageTransition from '@/components/page-transition';
import Header from '@/components/header';
import ClientNavbar from '@/components/client-navbar';
import Footer from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import BackToTop from '@/components/back-to-top';

export default function AppClientShell({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Skip splash on repeat visits within the same browser session
        if (sessionStorage.getItem('splashShown')) {
            setIsLoading(false);
            return;
        }
        const timer = setTimeout(() => {
            setIsLoading(false);
            sessionStorage.setItem('splashShown', '1');
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <SplashScreen isVisible={isLoading} />
            <Header />
            <ClientNavbar />
            <main className="flex-grow">
            <PageTransition>
                {children}
            </PageTransition>
            </main>
            <Footer />
            <Toaster />
            <BackToTop />
        </>
    );
}
