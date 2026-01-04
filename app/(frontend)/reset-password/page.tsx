import ResetPasswordForm from '@/components/auth/reset-password-form';
import ResetPasswordPageClient from '@/components/auth/reset-password-page-client';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
    return (
        <ResetPasswordPageClient>
            <Suspense fallback={<div className="text-white text-center">Зареждане...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </ResetPasswordPageClient>
    );
}
