import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Shield, User } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersManager() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: usersData, isLoading, refetch } = trpc.admin.users.list.useQuery({
    page,
    limit,
  });

  const updateRoleMutation = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
  });

  const handleRoleChange = (userId: number, newRole: "user" | "admin") => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
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
        <CardTitle>Users Management</CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Signed In</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData?.data?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                  <TableCell className="text-sm text-gray-600">{user.email || "N/A"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {user.role === "admin" ? (
                        <>
                          <Shield className="w-3 h-3 inline mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 inline mr-1" />
                          User
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.role === "user" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user.id, "admin")}
                          disabled={updateRoleMutation.isPending}
                        >
                          Make Admin
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user.id, "user")}
                          disabled={updateRoleMutation.isPending}
                        >
                          Remove Admin
                        </Button>
                      )}
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
            Showing {usersData?.data?.length || 0} of {usersData?.total || 0} users
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
              disabled={!usersData?.data || usersData.data.length < limit}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
