import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { BarChart3, Users, FileText, MessageSquare, Tag, Zap } from "lucide-react";
import AdminToolsManager from "@/components/admin/AdminToolsManager";
import AdminCategoriesManager from "@/components/admin/AdminCategoriesManager";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import AdminMessagesManager from "@/components/admin/AdminMessagesManager";
import AdminBlogManager from "@/components/admin/AdminBlogManager";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const { data: stats, isLoading: statsLoading } = trpc.admin.dashboard.stats.useQuery();

  if (authLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your LaunchPilot AI platform</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.tools || 0}</div>
              <p className="text-xs text-gray-500 mt-1">AI tools in database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.categories || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Tool categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.users || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Total users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.messages || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Contact messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.posts || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Blog posts</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="import">Import/Export</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="mt-6">
            <AdminToolsManager />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <AdminCategoriesManager />
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            <AdminBlogManager />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <AdminUsersManager />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <AdminMessagesManager />
          </TabsContent>

          <TabsContent value="import" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Import/Export Data</CardTitle>
                <CardDescription>Manage bulk data operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-600">Import/Export functionality coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
