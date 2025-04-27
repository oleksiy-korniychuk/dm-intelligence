'use client';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
    const router = useRouter();
    const supabase = createClient();
    const pathname = usePathname();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            router.push('/login');
        }
    };

    const isHomePage = pathname === '/';

    return (
        <header className="w-full border-b border-foreground/10">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    {!isHomePage && (
                        <button
                            onClick={() => router.back()}
                            className="mr-4 px-2 py-1 text-sm bg-foreground/10 hover:bg-foreground/20 rounded-md transition-colors"
                        >
                            Back
                        </button>
                    )}
                    <Link href="/">
                        <h1 className="text-xl font-bold cursor-pointer">DM Intelligence</h1>
                    </Link>
                </div>
                <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm bg-foreground/10 hover:bg-foreground/20 rounded-md transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}