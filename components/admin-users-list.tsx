"use client"

import { useEffect, useState } from "react"
import { getAdminUsers } from "@/app/actions/admin"
import { User } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Mail, Calendar, User as UserIcon } from "lucide-react"

export function AdminUsersList() {
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const result = await getAdminUsers()

        if (result.status === "success" && result.data) {
          setAdmins(result.data.admins)
        } else {
          setError(result.message)
        }
      } catch (err) {
        setError("Failed to load admin users")
      } finally {
        setLoading(false)
      }
    }

    fetchAdmins()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Users
          </CardTitle>
          <CardDescription>Loading admin users...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Users
          </CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Users
        </CardTitle>
        <CardDescription>
          {admins.length} administrator{admins.length !== 1 ? 's' : ''} with full system access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admin users found.</p>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {admin.name ? (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{admin.name}</span>
                      </div>
                    ) : (
                      <span className="font-medium text-muted-foreground">No name</span>
                    )}
                    {admin.isFirstUser && (
                      <Badge variant="secondary" className="text-xs">
                        First User
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {admin.email}
                  </div>

                  {admin.createdAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(admin.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <Badge variant="default" className="bg-green-600">
                  Admin
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}