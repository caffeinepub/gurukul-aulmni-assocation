import { useState } from 'react';
import { useListApprovals, useSetApproval } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ApprovalStatus } from '@/backend';
import type { UserApprovalInfo } from '@/backend';
import { Principal } from '@icp-sdk/core/principal';

export default function MembersAdminPanel() {
  const { data: approvals = [], isLoading, isError, refetch } = useListApprovals();
  const setApprovalMutation = useSetApproval();
  const [confirmAction, setConfirmAction] = useState<{
    user: Principal;
    status: ApprovalStatus;
    action: string;
  } | null>(null);

  const handleSetApproval = async (user: Principal, status: ApprovalStatus) => {
    try {
      await setApprovalMutation.mutateAsync({ user, status });
      toast.success(`Member ${status === ApprovalStatus.approved ? 'approved' : status === ApprovalStatus.rejected ? 'rejected' : 'updated'} successfully`);
      setConfirmAction(null);
    } catch (error) {
      toast.error('Failed to update member status. Please try again.');
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.approved:
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case ApprovalStatus.pending:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case ApprovalStatus.rejected:
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

  const formatPrincipal = (principal: Principal) => {
    const str = principal.toString();
    return `${str.slice(0, 8)}...${str.slice(-5)}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading members...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Member Management</CardTitle>
          <CardDescription>
            Approve, reject, or manage member access to the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Unable to Load Members</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              There was an error loading the member list. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Member Management</CardTitle>
          <CardDescription>
            Approve, reject, or manage member access to the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No members to manage
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Principal ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map((approval) => (
                    <TableRow key={approval.principal.toString()}>
                      <TableCell className="font-mono text-sm">
                        {formatPrincipal(approval.principal)}
                      </TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {approval.status !== ApprovalStatus.approved && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                setConfirmAction({
                                  user: approval.principal,
                                  status: ApprovalStatus.approved,
                                  action: 'approve',
                                })
                              }
                              disabled={setApprovalMutation.isPending}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                          )}
                          {approval.status !== ApprovalStatus.rejected && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                setConfirmAction({
                                  user: approval.principal,
                                  status: ApprovalStatus.rejected,
                                  action: 'reject',
                                })
                              }
                              disabled={setApprovalMutation.isPending}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === 'approve' ? 'Approve Member' : 'Reject Member'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction?.action} this member? This action can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) {
                  handleSetApproval(confirmAction.user, confirmAction.status);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
