import { isAdmin } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRoleManagement } from "@/components/user-role-management";
import { AdminUsersList } from "@/components/admin-users-list";
import Link from "next/link";
import { Database } from "lucide-react";

// Mark this page as dynamic since it uses authentication
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Check if the current user has admin privileges
  const adminStatus = await isAdmin();
  if (!adminStatus) {
    return (
      <div className="container py-12">
        <p>Unauthorized</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Database Tools Card */}
        <Card>
          <CardHeader>
            <CardTitle>Database Tools</CardTitle>
            <CardDescription>Access database utilities and testing functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/db-test" className="flex items-center justify-center gap-2">
                  <Database className="h-4 w-4" />
                  DB Test
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <AdminUsersList />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage user roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserRoleManagement />
        </CardContent>
      </Card>
    </div>
  );
}
