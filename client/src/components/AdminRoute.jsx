import React from 'react';
import { useUser } from "@clerk/clerk-react";
import NotFound from '../pages/NotFound';
import { Skeleton } from "@/components/ui/skeleton";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const AdminRoute = ({ children }) => {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-6xl" dir="rtl">
                <Skeleton className="h-32 w-full rounded-xl mb-6" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    const isAdmin = user && user.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

    if (!isAdmin) {
        return <NotFound />;
    }

    return children;
};

export default AdminRoute;
