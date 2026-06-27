import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminBlogManager() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: postsData, isLoading, refetch } = trpc.admin.posts.list.useQuery({
    page,
    limit,
  });

  const deleteMutation = trpc.admin.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
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
            <CardTitle>Blog Posts Management</CardTitle>
            <CardDescription>Manage blog articles and content</CardDescription>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postsData?.data?.map((post: any) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                  <TableCell className="text-sm text-gray-600">{post.slug}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      post.status === "published"
                        ? "bg-green-100 text-green-800"
                        : post.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
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
            Showing {postsData?.data?.length || 0} of {postsData?.total || 0} posts
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
              disabled={!postsData?.data || postsData.data.length < limit}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
