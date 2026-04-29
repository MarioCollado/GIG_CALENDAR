import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
    title: 'Concert Feed',
    description: 'Próximos conciertos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body className="bg-slate-50 text-slate-900 antialiased font-sans">
                <Navbar />
                <div className="pb-20 md:pb-0">
                    {children}
                </div>
            </body>
        </html>
    )
}