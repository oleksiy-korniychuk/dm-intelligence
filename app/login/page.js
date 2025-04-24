'use client';

import { login } from './actions';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-background border border-foreground/10 rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-8">Sign In</h2>
                <form action={login} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-foreground text-background rounded-md hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}