import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Shield, 
  UserCheck, 
  UserX, 
  Settings, 
  Mail, 
  Phone, 
  Calendar, 
  Edit2, 
  Trash2, 
  Search, 
  Eye,
  Crown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminPermissionsPanel } from './AdminPermissionsPanel';

interface AdminUser {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

interface AdminPermission {
  section: string;
  display_name: string;
  is_enabled: boolean;
  description?: string;
}

export const AdminManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', address: '' });

  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['admin-admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminUser[];
    }
  });

  // Real-time subscription for admin users
  useEffect(() => {
    const channel = supabase
      .channel('admin-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: 'role=in.(admin,super_admin)'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-admin-users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Real-time subscription for admin permissions
  useEffect(() => {
    const channel = supabase
      .channel('admin-permissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_permissions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: adminPermissions } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as AdminPermission[];
    }
  });

  const updateAdminMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AdminUser> }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admin-users'] });
      toast({ title: 'Success', description: 'Admin updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to update admin',
        variant: 'destructive'
      });
    }
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', adminId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admin-users'] });
      toast({ title: 'Success', description: 'Admin deleted successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete admin',
        variant: 'destructive'
      });
    }
  });

  const promoteToAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('promote_user_role', {
        user_uuid: userId,
        new_role: 'admin'
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admin-users'] });
      toast({ title: 'Success', description: 'User promoted to admin successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to promote user',
        variant: 'destructive'
      });
    }
  });

  const handleBlockToggle = (adminId: string, isBlocked: boolean) => {
    updateAdminMutation.mutate({
      id: adminId,
      updates: { is_blocked: isBlocked }
    });
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditForm({
      full_name: admin.full_name || '',
      phone: admin.phone || '',
      address: admin.address || ''
    });
  };

  const handleSaveEdit = () => {
    if (!editingAdmin) return;
    
    updateAdminMutation.mutate({
      id: editingAdmin.id,
      updates: editForm
    });
    setEditingAdmin(null);
  };

  const handleDeleteAdmin = (adminId: string) => {
    deleteAdminMutation.mutate(adminId);
  };

  const filteredAdmins = adminUsers?.filter(admin =>
    admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.phone?.includes(searchTerm) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'super_admin' ? <Crown className="w-4 h-4" /> : <Shield className="w-4 h-4" />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Crown className="h-8 w-8 mr-3 text-purple-600" />
            Admin Management
          </h1>
          <p className="text-gray-600">Manage admin users and their system permissions</p>
        </div>
        <Button variant="outline">
          Export Admins
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search admins by name, phone, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Admins', 
            value: filteredAdmins?.length || 0, 
            color: 'text-blue-600' 
          },
          { 
            title: 'Super Admins', 
            value: filteredAdmins?.filter(u => u.role === 'super_admin').length || 0, 
            color: 'text-purple-600' 
          },
          { 
            title: 'Regular Admins', 
            value: filteredAdmins?.filter(u => u.role === 'admin').length || 0, 
            color: 'text-blue-600' 
          },
          { 
            title: 'Blocked Admins', 
            value: filteredAdmins?.filter(u => u.is_blocked).length || 0, 
            color: 'text-red-600' 
          }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-sm ${stat.color}`}>{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Permissions Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Permissions Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Control which dashboard sections are accessible to regular Admin users.
          </p>
          <AdminPermissionsPanel />
        </CardContent>
      </Card>

      {/* Admin List */}
      <div className="space-y-4">
        {filteredAdmins?.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Admin Info */}
                <div className="lg:col-span-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      admin.role === 'super_admin' 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-700' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      <span className="text-white font-bold">
                        {admin.full_name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{admin.full_name || 'Unnamed Admin'}</h3>
                      <Badge className={`${getRoleColor(admin.role)} border`}>
                        {getRoleIcon(admin.role)}
                        <span className="ml-1">{admin.role.replace('_', ' ').toUpperCase()}</span>
                      </Badge>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Joined {new Date(admin.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="lg:col-span-4 space-y-1">
                  {admin.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{admin.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>User ID: {admin.user_id.substring(0, 8)}...</span>
                  </div>
                  {admin.address && (
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>Address:</strong> {admin.address}
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`blocked-${admin.id}`}
                        checked={admin.is_blocked}
                        onCheckedChange={(checked) => handleBlockToggle(admin.id, checked)}
                        disabled={admin.role === 'super_admin'} // Can't block super admin
                      />
                      <Label htmlFor={`blocked-${admin.id}`} className="text-sm">
                        {admin.is_blocked ? 'Blocked' : 'Active'}
                      </Label>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAdmin(admin)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Permissions
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAdmin(admin)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      
                      {admin.is_blocked ? (
                        <Button
                          size="sm"
                          onClick={() => handleBlockToggle(admin.id, false)}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={admin.role === 'super_admin'}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlockToggle(admin.id, true)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          disabled={admin.role === 'super_admin'}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Block
                        </Button>
                      )}

                      {admin.role !== 'super_admin' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Admin User</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the admin account and revoke all administrative privileges.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteAdmin(admin.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Admin
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Permissions Dialog */}
      <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Admin Permissions - {selectedAdmin?.full_name}
            </DialogTitle>
            <DialogDescription>
              View the current system permissions for this admin user. Only Super Admins can modify these permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {adminPermissions?.map((permission) => (
                <Card key={permission.section}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{permission.display_name}</h4>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                      <Badge variant={permission.is_enabled ? "default" : "secondary"}>
                        {permission.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-sm text-gray-500 italic">
              * Super Admin users have access to all sections regardless of these settings
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAdmin(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin User</DialogTitle>
            <DialogDescription>
              Update admin user information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAdmin(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};