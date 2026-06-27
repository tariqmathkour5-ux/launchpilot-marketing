import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminToolsManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 20;

  const { data: toolsData, isLoading, refetch } = trpc.admin.tools.list.useQuery({
    page,
    limit,
    search: search || undefined,
  });

  const deleteMutation = trpc.admin.tools.delete.useMutation({
    onSuccess: () => {
      toast.success("Tool deleted successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete tool");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this tool?")) {
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tools Management</CardTitle>
            <CardDescription>Manage AI tools in your database</CardDescription>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Tool
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-md"
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toolsData?.data?.map((tool: any) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{tool.website}</TableCell>
                  <TableCell className="text-sm">{tool.pricingModel}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tool.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {tool.isVerified ? "Verified" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {}}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tool.id)}
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
            Showing {toolsData?.data?.length || 0} of {toolsData?.total || 0} tools
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
              disabled={!toolsData?.data || toolsData.data.length < limit}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
