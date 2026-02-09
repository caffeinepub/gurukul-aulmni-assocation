import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AuthButton from './AuthButton';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, principalShort } = useCurrentUser();

  const navLinks = [
    { label: 'Directory', path: '/directory' },
    { label: 'Events', path: '/events' },
    { label: 'Announcements', path: '/announcements' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img
              src="/assets/generated/gurukul-logo.dim_512x512.png"
              alt="Gurukul Alumni"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div className="hidden flex-col sm:flex">
              <span className="text-lg font-bold leading-tight text-foreground">Gurukul Aulmni Assocation</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                onClick={() => navigate({ to: link.path })}
                className="text-sm font-medium"
              >
                {link.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <div className="hidden items-center gap-3 md:flex">
              <Button variant="outline" size="sm" onClick={() => navigate({ to: '/my-profile' })}>
                <GraduationCap className="mr-2 h-4 w-4" />
                {userProfile?.fullName || principalShort}
              </Button>
            </div>
          )}
          <AuthButton />

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-4 pt-8">
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate({ to: '/my-profile' });
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    {userProfile?.fullName || principalShort}
                  </Button>
                )}
                {navLinks.map((link) => (
                  <Button
                    key={link.path}
                    variant="ghost"
                    onClick={() => {
                      navigate({ to: link.path });
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    {link.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
