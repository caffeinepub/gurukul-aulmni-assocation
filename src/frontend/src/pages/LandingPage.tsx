import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Calendar, Megaphone, ArrowRight } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useCurrentUser();

  const features = [
    {
      icon: Users,
      title: 'Alumni Directory',
      description: 'Connect with fellow alumni from across the years and departments',
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Stay updated on reunions, networking events, and special gatherings',
    },
    {
      icon: Megaphone,
      title: 'Announcements',
      description: 'Get the latest news and updates from the association',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-muted/50 to-background">
        <div className="container relative z-10 flex flex-col items-center gap-8 py-16 text-center md:py-24">
          <div className="flex flex-col items-center gap-4">
            <img
              src="/assets/generated/gurukul-logo.dim_512x512.png"
              alt="Gurukul Alumni"
              className="h-24 w-24 rounded-2xl object-cover shadow-lg md:h-32 md:w-32"
            />
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to <span className="text-primary">Gurukul Aulmni Assocation</span>
            </h1>
          </div>

          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Stay connected with your alma mater and fellow alumni. Share experiences, attend events, and build lasting
            professional relationships.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Button size="lg" onClick={() => navigate({ to: '/directory' })}>
                  Browse Directory
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: '/my-profile' })}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate({ to: '/directory' })}>
                  Explore Directory
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="absolute inset-0 -z-10 opacity-20">
          <img
            src="/assets/generated/gurukul-hero.dim_1600x600.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">What We Offer</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Join our vibrant community and take advantage of exclusive features designed to keep you connected
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/30">
        <div className="container py-16 text-center md:py-24">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Ready to Get Started?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            {isAuthenticated
              ? 'Complete your profile and start connecting with fellow alumni today'
              : 'Sign in to access the full alumni network and exclusive features'}
          </p>
          <Button
            size="lg"
            onClick={() => navigate({ to: isAuthenticated ? '/my-profile' : '/directory' })}
          >
            {isAuthenticated ? 'Complete Your Profile' : 'Get Started'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
