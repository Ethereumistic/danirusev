import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface LegalNavigationProps {
    leftLink: { href: string; label: string };
    rightLink: { href: string; label: string };
}

export function LegalNavigation({ leftLink, rightLink }: LegalNavigationProps) {
    return (
        <div className="mt-20 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-white/5 pt-10">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl group border-white/5 transition-all" asChild>
                <Link href={leftLink.href} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="font-black uppercase italic tracking-tighter">{leftLink.label}</span>
                </Link>
            </Button>

            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl group border-white/5 transition-all" asChild>
                <Link href={rightLink.href} className="flex items-center gap-2">
                    <span className="font-black uppercase italic tracking-tighter">{rightLink.label}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </Button>
        </div>
    );
}
