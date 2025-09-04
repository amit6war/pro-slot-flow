
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UserX, UserCheck, Mail, Phone, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

export const UserManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any;
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserProfile> }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates as any)
        .eq('id' as any, id as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Success', description: 'User updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to update user',
        variant: 'destructive'
      });
    }
  });

  const handleBlockToggle = (userId: string, isBlocked: boolean) => {
    updateUserMutation.mutate({
      id: userId,
      updates: { is_blocked: isBlocked }
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'provider': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
        <Button variant="outline">
          Export Users
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Users', 
            value: users?.length || 0, 
            color: 'text-blue-600' 
          },
          { 
            title: 'Customers', 
            value: users?.filter(u => u.role === 'customer').length || 0, 
            color: 'text-green-600' 
          },
          { 
            title: 'Providers', 
            value: users?.filter(u => u.role === 'provider').length || 0, 
            color: 'text-purple-600' 
          },
          { 
            title: 'Blocked Users', 
            value: users?.filter(u => u.is_blocked).length || 0, 
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

      {/* User List */}
      <div className="space-y-4">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* User Info */}
                <div className="lg:col-span-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{user.full_name || 'Unnamed User'}</h3>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="lg:col-span-4 space-y-1">
                  {user.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>User ID: {user.user_id.substring(0, 8)}...</span>
                  </div>
                  {user.address && (
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>Address:</strong> {user.address}
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`blocked-${user.id}`}
                        checked={user.is_blocked}
                        onCheckedChange={(checked) => handleBlockToggle(user.id, checked)}
                      />
                      <Label htmlFor={`blocked-${user.id}`} className="text-sm">
                        {user.is_blocked ? 'Blocked' : 'Active'}
                      </Label>
                    </div>
                    
                    <div className="flex space-x-2">
                      {user.is_blocked ? (
                        <Button
                          size="sm"
                          onClick={() => handleBlockToggle(user.id, false)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlockToggle(user.id, true)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Block
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
