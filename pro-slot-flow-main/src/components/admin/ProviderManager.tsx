
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  Eye, 
  UserCheck, 
  UserX,
  Award,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServiceProvider {
  id: string;
  user_id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  license_number?: string;
  license_document_url?: string;
  id_document_url?: string;
  status: string;
  is_featured: boolean;
  is_emergency_offline: boolean;
  rating: number;
  total_reviews: number;
  total_completed_jobs: number;
  response_time_minutes: number;
}

export const ProviderManager = () => {
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ServiceProvider[];
    }
  });

  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ServiceProvider> }) => {
      const { data, error } = await supabase
        .from('service_providers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      toast({ title: 'Success', description: 'Provider updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to update provider',
        variant: 'destructive'
      });
    }
  });

  const handleStatusChange = (providerId: string, newStatus: string) => {
    updateProviderMutation.mutate({
      id: providerId,
      updates: { status: newStatus }
    });
  };

  const handleFeaturedToggle = (providerId: string, isFeatured: boolean) => {
    updateProviderMutation.mutate({
      id: providerId,
      updates: { is_featured: isFeatured }
    });
  };

  const handleEmergencyOfflineToggle = (providerId: string, isOffline: boolean) => {
    updateProviderMutation.mutate({
      id: providerId,
      updates: { is_emergency_offline: isOffline }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold">Provider Management</h1>
          <p className="text-gray-600">Approve, manage, and monitor service providers</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            Export Data
          </Button>
          <Button>
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Providers', 
            value: providers?.length || 0, 
            color: 'text-blue-600' 
          },
          { 
            title: 'Pending Approval', 
            value: providers?.filter(p => p.status === 'pending').length || 0, 
            color: 'text-yellow-600' 
          },
          { 
            title: 'Approved', 
            value: providers?.filter(p => p.status === 'approved').length || 0, 
            color: 'text-green-600' 
          },
          { 
            title: 'Featured', 
            value: providers?.filter(p => p.is_featured).length || 0, 
            color: 'text-purple-600' 
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

      {/* Provider List */}
      <div className="space-y-4">
        {providers?.map((provider) => (
          <Card key={provider.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Provider Info */}
                <div className="lg:col-span-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">
                        {provider.business_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{provider.business_name}</h3>
                      <p className="text-gray-600">{provider.contact_person}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{provider.rating}</span>
                        <span className="text-gray-500 text-sm">({provider.total_reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="lg:col-span-3 space-y-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{provider.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{provider.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{provider.address}</span>
                  </div>
                </div>

                {/* Status & Stats */}
                <div className="lg:col-span-2">
                  <Badge className={`mb-2 ${getStatusColor(provider.status)}`}>
                    {provider.status.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    <div>{provider.total_completed_jobs} jobs completed</div>
                    <div>~{provider.response_time_minutes}min response</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="lg:col-span-3 space-y-3">
                  {provider.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(provider.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(provider.id, 'rejected')}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`featured-${provider.id}`}
                        checked={provider.is_featured}
                        onCheckedChange={(checked) => handleFeaturedToggle(provider.id, checked)}
                      />
                      <Label htmlFor={`featured-${provider.id}`} className="text-sm">
                        <Award className="w-4 h-4 inline mr-1" />
                        Featured
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`offline-${provider.id}`}
                        checked={provider.is_emergency_offline}
                        onCheckedChange={(checked) => handleEmergencyOfflineToggle(provider.id, checked)}
                      />
                      <Label htmlFor={`offline-${provider.id}`} className="text-sm">
                        Emergency Offline
                      </Label>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedProvider(provider)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    
                    {provider.status === 'approved' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(provider.id, 'blocked')}
                        className="border-red-300 text-red-600"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Block
                      </Button>
                    ) : provider.status === 'blocked' ? (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(provider.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Unblock
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider Details Modal would go here */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Provider Details
                <Button variant="ghost" onClick={() => setSelectedProvider(null)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <p className="font-medium">{selectedProvider.business_name}</p>
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <p className="font-medium">{selectedProvider.contact_person}</p>
                </div>
              </div>
              
              {selectedProvider.license_number && (
                <div>
                  <Label>License Number</Label>
                  <p className="font-medium">{selectedProvider.license_number}</p>
                </div>
              )}
              
              <div>
                <Label>Full Address</Label>
                <p className="font-medium">{selectedProvider.address}</p>
              </div>

              {selectedProvider.license_document_url && (
                <div>
                  <Label>License Document</Label>
                  <Button variant="outline" asChild>
                    <a href={selectedProvider.license_document_url} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </Button>
                </div>
              )}

              {selectedProvider.id_document_url && (
                <div>
                  <Label>ID Document</Label>
                  <Button variant="outline" asChild>
                    <a href={selectedProvider.id_document_url} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
