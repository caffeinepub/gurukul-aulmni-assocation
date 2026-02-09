import { BUILD_VERSION } from '@/config/buildInfo';

export default function BuildVersionLabel() {
  return (
    <span className="text-xs text-muted-foreground">
      Build: {BUILD_VERSION}
    </span>
  );
}
