"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <span>BookFlow</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/professional/login"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Para profesionales
                        </Link>
                        <Link
                            href="/booking"
                            className="px-6 py-2 text-sm font-medium bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                        >
                            Reservar
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}