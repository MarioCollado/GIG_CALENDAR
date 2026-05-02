import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
    title: 'Agenda de conciertos',
    description: 'Agenda de conciertos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body className="antialiased font-sans" style={{ background: '#0f172a', color: '#f1f5f9', minHeight: '100vh' }}>
                <Navbar />
                <div className="pb-20 md:pb-0">
                    {children}
                </div>
            </body>
        </html>
    )
}