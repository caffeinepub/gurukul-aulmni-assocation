import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface BackendUnavailableCardProps {
  onRetry: () => void;
  title?: string;
  description?: string;
}

export default function BackendUnavailableCard({
  onRetry,
  title = 'Unable to Connect',
  description = 'We are having trouble connecting to the backend. Please check your connection and try again.',
}: BackendUnavailableCardProps) {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={onRetry} size="lg">
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
