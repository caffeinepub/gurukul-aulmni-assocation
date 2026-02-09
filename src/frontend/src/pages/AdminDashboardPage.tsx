import { useState } from 'react';
import { useAccess } from '@/hooks/useAccess';
import RequireApproved from '@/components/RequireApproved';
import MembersAdminPanel from '@/components/admin/MembersAdminPanel';
import AnnouncementAdminPanel from '@/components/AnnouncementAdminPanel';
import EventAdminPanel from '@/components/EventAdminPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ShieldX, Users, Megaphone, Calendar, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <RequireApproved>
      <AdminDashboardContent />
    </RequireApproved>
  );
}

function AdminDashboardContent() {
  const { isAdmin, canManageMembers, canManageContent, canManageEvents, isLoading, isError, retry } = useAccess();
  const [activeTab, setActiveTab] = useState('members');

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Unable to Load Data</CardTitle>
            <CardDescription>
              There was an error loading admin access information. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={retry} size="lg">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage members, content, and events for the alumni association
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {canManageMembers && (
            <TabsTrigger value="members">
              <Users className="mr-2 h-4 w-4" />
              Members
            </TabsTrigger>
          )}
          {canManageContent && (
            <TabsTrigger value="content">
              <Megaphone className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
          )}
          {canManageEvents && (
            <TabsTrigger value="events">
              <Calendar className="mr-2 h-4 w-4" />
              Events
            </TabsTrigger>
          )}
        </TabsList>

        {canManageMembers && (
          <TabsContent value="members">
            <MembersAdminPanel />
          </TabsContent>
        )}

        {canManageContent && (
          <TabsContent value="content">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Announcement Management</CardTitle>
                  <CardDescription>
                    Create and manage announcements for the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnnouncementAdminPanel />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {canManageEvents && (
          <TabsContent value="events">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>
                    Create and manage events for the alumni community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EventAdminPanel />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
