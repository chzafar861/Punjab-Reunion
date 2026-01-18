import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Shield, UserCheck, UserX, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UserRoleRecord } from "@shared/schema";

const roleColors: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  contributor: "secondary",
  member: "outline",
};

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    userId: "",
    role: "member",
    canSubmitProfiles: false,
    canManageProducts: false,
  });

  const { data: users, isLoading, error } = useQuery<UserRoleRecord[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateRole = useMutation({
    mutationFn: async (data: {
      userId: string;
      role: string;
      canSubmitProfiles: boolean;
      canManageProducts: boolean;
    }) => {
      const response = await apiRequest("POST", `/api/admin/users/${data.userId}/role`, {
        role: data.role,
        canSubmitProfiles: data.canSubmitProfiles,
        canManageProducts: data.canManageProducts,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User role updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddDialog(false);
      setNewUserData({
        userId: "",
        role: "member",
        canSubmitProfiles: false,
        canManageProducts: false,
      });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.userId) {
      toast({ title: "Error", description: "User ID is required", variant: "destructive" });
      return;
    }
    updateRole.mutate(newUserData);
  };

  const filteredUsers = users?.filter(
    (user) =>
      user.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-semibold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-user-role">
            <Shield className="w-4 h-4 mr-2" />
            Add User Role
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Roles
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-users"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Can Submit Profiles</TableHead>
                    <TableHead>Can Manage Products</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">{user.userId}</TableCell>
                      <TableCell>
                        <Badge variant={roleColors[user.role] || "outline"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.canSubmitProfiles ? (
                          <UserCheck className="w-5 h-5 text-green-500" />
                        ) : (
                          <UserX className="w-5 h-5 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.canManageProducts ? (
                          <UserCheck className="w-5 h-5 text-green-500" />
                        ) : (
                          <UserX className="w-5 h-5 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(role) =>
                              updateRole.mutate({
                                userId: user.userId,
                                role,
                                canSubmitProfiles: user.canSubmitProfiles || false,
                                canManageProducts: user.canManageProducts || false,
                              })
                            }
                          >
                            <SelectTrigger className="w-28" data-testid={`select-user-role-${user.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="contributor">Contributor</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No user roles configured yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User Role</DialogTitle>
            <DialogDescription>
              Assign a role and permissions to a user by their Supabase User ID.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                value={newUserData.userId}
                onChange={(e) => setNewUserData({ ...newUserData, userId: e.target.value })}
                placeholder="Enter Supabase User ID"
                required
                data-testid="input-new-user-id"
              />
              <p className="text-xs text-muted-foreground">
                You can find user IDs in your Supabase dashboard under Authentication > Users
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUserData.role}
                onValueChange={(role) => setNewUserData({ ...newUserData, role })}
              >
                <SelectTrigger data-testid="select-new-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="canSubmitProfiles">Can Submit Profiles</Label>
              <Switch
                id="canSubmitProfiles"
                checked={newUserData.canSubmitProfiles}
                onCheckedChange={(checked) =>
                  setNewUserData({ ...newUserData, canSubmitProfiles: checked })
                }
                data-testid="switch-can-submit-profiles"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="canManageProducts">Can Manage Products</Label>
              <Switch
                id="canManageProducts"
                checked={newUserData.canManageProducts}
                onCheckedChange={(checked) =>
                  setNewUserData({ ...newUserData, canManageProducts: checked })
                }
                data-testid="switch-can-manage-products"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateRole.isPending} data-testid="button-save-user-role">
                {updateRole.isPending ? "Saving..." : "Add User Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
