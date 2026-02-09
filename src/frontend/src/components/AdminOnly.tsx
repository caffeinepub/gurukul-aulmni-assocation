import { type ReactNode } from 'react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminOnly({ children, fallback }: AdminOnlyProps) {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You do not have permission to access this feature</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <>{children}</>;
}
