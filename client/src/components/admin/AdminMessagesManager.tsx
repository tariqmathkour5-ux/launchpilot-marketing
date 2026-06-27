import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminMessagesManager() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"new" | "read" | "replied" | "archived" | undefined>();
  const limit = 20;

  const { data: messagesData, isLoading, refetch } = trpc.admin.messages.list.useQuery({
    page,
    limit,
    status,
  });

  const updateStatusMutation = trpc.admin.messages.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Message status updated");
      refetch();
    },
  });

  const deleteMutation = trpc.admin.messages.delete.useMutation({
    onSuccess: () => {
      toast.success("Message deleted");
      refetch();
    },
  });

  const handleStatusChange = (id: number, newStatus: "new" | "read" | "replied" | "archived") => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Messages</CardTitle>
        <CardDescription>Manage contact form submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex gap-2">
          <Button
            variant={status === undefined ? "default" : "outline"}
            onClick={() => setStatus(undefined)}
          >
            All
          </Button>
          <Button
            variant={status === "new" ? "default" : "outline"}
            onClick={() => setStatus("new")}
          >
            New
          </Button>
          <Button
            variant={status === "read" ? "default" : "outline"}
            onClick={() => setStatus("read")}
          >
            Read
          </Button>
          <Button
            variant={status === "replied" ? "default" : "outline"}
            onClick={() => setStatus("replied")}
          >
            Replied
          </Button>
          <Button
            variant={status === "archived" ? "default" : "outline"}
            onClick={() => setStatus("archived")}
          >
            Archived
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messagesData?.data?.map((message: any) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{message.email}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{message.subject}</TableCell>
                  <TableCell>
                    <select
                      value={message.status}
                      onChange={(e) => handleStatusChange(message.id, e.target.value as any)}
                      className="px-2 py-1 rounded text-xs border border-gray-300"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(message.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {messagesData?.data?.length || 0} of {messagesData?.total || 0} messages
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={!messagesData?.data || messagesData.data.length < limit}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
