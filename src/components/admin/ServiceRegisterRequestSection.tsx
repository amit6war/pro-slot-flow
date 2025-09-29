import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Filter,
  DollarSign,
  Star
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ProviderRegistrationRequest {
  id: string;
  user_id: string;
  category_id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  license_number: string;
  license_document_url: string | null;
  id_document_url: string | null;
  business_registration_url: string | null;
  experience_years: number;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
  };
  category_name?: string;
  user_email?: string;
}

interface SubcategoryRequest {
  id: string;
  provider_id: string;
  subcategory_id: string;
  service_name: string;
  description: string | null;
  price: number;
  license_number: string | null;
  license_document_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subcategory?: {
    id: string;
    name: string;
    description: string;
    category?: {
      id: string;
      name: string;
      description: string;
    };
  };
  provider?: {
    id: string;
    full_name: string | null;
    business_name: string | null;
  };
}

export const ServiceRegisterRequestSection = () => {
  const [activeTab, setActiveTab] = useState<'category' | 'subcategory'>('category');
  const [requests, setRequests] = useState<ProviderRegistrationRequest[]>([]);
  const [subcategoryRequests, setSubcategoryRequests] = useState<SubcategoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ProviderRegistrationRequest | null>(null);
  const [selectedSubcategoryRequest, setSelectedSubcategoryRequest] = useState<SubcategoryRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();
  const { user, isRole } = useAuth();

  const canManageRequests = isRole('admin') || isRole('super_admin');

  useEffect(() => {
    if (canManageRequests) {
      fetchRequests();
      fetchSubcategoryRequests();
    }
  }, [canManageRequests, filter]);

  const fetchSubcategoryRequests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('provider_services')
        .select(`
          *,
          subcategory:subcategories(
            id,
            name,
            description,
            category:categories(
              id,
              name,
              description
            )
          ),
          provider:user_profiles!provider_id(
            id,
            full_name,
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching subcategory requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch subcategory requests',
          variant: 'destructive',
        });
        return;
      }

      setSubcategoryRequests((data || []).map((item: any) => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      })));
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('provider_registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch registration requests',
          variant: 'destructive',
        });
        return;
      }

      const requestsData = (data || []) as any[];
      let categoryMap: Record<string, string> = {};
      if (requestsData.length > 0) {
        const categoryIds = Array.from(new Set(requestsData.map(r => r.category_id).filter(Boolean)));
        if (categoryIds.length > 0) {
          const { data: cats, error: catErr } = await supabase
            .from('categories')
            .select('id,name')
            .in('id', categoryIds);
          if (!catErr && cats) {
            categoryMap = Object.fromEntries(cats.map(c => [c.id, c.name]));
          }
        }
      }

      const transformedData: ProviderRegistrationRequest[] = requestsData.map((request: any) => ({
        ...request,
        status: (request.status as 'pending' | 'approved' | 'rejected'),
        category_name: categoryMap[request.category_id] || undefined,
        user_email: request.email,
      }));

      setRequests(transformedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!canManageRequests) return;

    try {
      setProcessingId(requestId);
      
      const { error } = await supabase
        .from('provider_registration_requests')
        .update({
          status: 'approved'
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error approving request:', error);
        toast({
          title: 'Error',
          description: 'Failed to approve request',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Provider registration request approved successfully',
      });

      fetchRequests();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubcategoryApproval = async (serviceId: string, status: 'approved' | 'rejected') => {
    if (!canManageRequests) return;

    try {
      setProcessingId(serviceId);
      
      const { error } = await supabase
        .from('provider_services')
        .update({
          status: status,
          is_active: status === 'approved'
        })
        .eq('id', serviceId);

      if (error) {
        console.error('Error updating subcategory request:', error);
        toast({
          title: 'Error',
          description: 'Failed to update subcategory request',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: `Subcategory request ${status} successfully`,
      });

      fetchSubcategoryRequests();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    if (!canManageRequests || !reason.trim()) return;

    try {
      setProcessingId(requestId);
      
      const { error } = await supabase
        .from('provider_registration_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason.trim(),
          rejected_by: user?.id,
          rejected_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting request:', error);
        toast({
          title: 'Error',
          description: 'Failed to reject request',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Provider registration request rejected',
      });

      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!canManageRequests) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to manage provider registration requests.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Registration Requests</h2>
          <p className="text-gray-600 mt-1">Review and manage provider registration requests</p>
        </div>
        <Button onClick={() => {
          fetchRequests();
          fetchSubcategoryRequests();
        }} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('category')}
          className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'category'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Category Requests
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {requests.filter(r => r.status === 'pending').length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('subcategory')}
          className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'subcategory'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Subcategory Requests
          {subcategoryRequests.filter(r => r.status === 'pending').length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {subcategoryRequests.filter(r => r.status === 'pending').length}
            </Badge>
          )}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'pending' && (
              activeTab === 'category' 
                ? requests.filter(r => r.status === 'pending').length > 0
                : subcategoryRequests.filter(r => r.status === 'pending').length > 0
            ) && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeTab === 'category' 
                  ? requests.filter(r => r.status === 'pending').length
                  : subcategoryRequests.filter(r => r.status === 'pending').length
                }
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'category' ? (
        /* Category Requests */
        loading ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading requests...</span>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filter === 'all' ? 'No Registration Requests' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? 'No provider registration requests have been submitted yet.'
                    : `No requests with ${filter} status found. Try changing the filter or refresh the data.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-blue-600" />
                        <span>{request.business_name}</span>
                        {getStatusBadge(request.status)}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {request.contact_person}
                        </span>
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {request.user_email}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(request.created_at)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{request.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{request.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">License: {request.license_number}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Category: </span>
                        <span className="text-sm">{request.category_name}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Experience: </span>
                        <span className="text-sm">{request.experience_years} years</span>
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex space-x-3">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                        disabled={processingId === request.id}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Subcategory Requests */
        loading ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading subcategory requests...</span>
            </CardContent>
          </Card>
        ) : subcategoryRequests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filter === 'all' ? 'No Subcategory Requests' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Subcategory Requests`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? 'No provider subcategory requests have been submitted yet.'
                    : `No subcategory requests with ${filter} status found.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {subcategoryRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-blue-600" />
                        <span>{request.service_name}</span>
                        {getStatusBadge(request.status)}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {request.provider?.full_name || request.provider?.business_name}
                        </span>
                        <span className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {request.subcategory?.category?.name} - {request.subcategory?.name}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(request.created_at)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">${request.price}</span>
                      </div>
                      {request.license_number && (
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">License: {request.license_number}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Category: </span>
                        <span className="text-sm">{request.subcategory?.category?.name}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Subcategory: </span>
                        <span className="text-sm">{request.subcategory?.name}</span>
                      </div>
                    </div>
                  </div>

                  {request.description && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">Description: </span>
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex space-x-3">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleSubcategoryApproval(request.id, 'approved')}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleSubcategoryApproval(request.id, 'rejected')}
                        disabled={processingId === request.id}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedSubcategoryRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Rejection Dialog for Category Requests */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Registration Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this registration request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="destructive"
                  onClick={() => handleReject(selectedRequest.id, rejectionReason)}
                  disabled={!rejectionReason.trim() || processingId === selectedRequest.id}
                >
                  {processingId === selectedRequest.id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  Reject Request
                </Button>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Details Dialog for Subcategory Requests */}
      {selectedSubcategoryRequest && (
        <Dialog open={!!selectedSubcategoryRequest} onOpenChange={() => setSelectedSubcategoryRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Subcategory Request Details</DialogTitle>
              <DialogDescription>
                Review the provider's subcategory service request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Provider</Label>
                  <p className="text-sm">{selectedSubcategoryRequest.provider?.full_name || selectedSubcategoryRequest.provider?.business_name}</p>
                </div>
                <div>
                  <Label>Service Name</Label>
                  <p className="text-sm">{selectedSubcategoryRequest.service_name}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="text-sm">{selectedSubcategoryRequest.subcategory?.category?.name}</p>
                </div>
                <div>
                  <Label>Subcategory</Label>
                  <p className="text-sm">{selectedSubcategoryRequest.subcategory?.name}</p>
                </div>
                <div>
                  <Label>Price</Label>
                  <p className="text-sm font-medium">${selectedSubcategoryRequest.price}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSubcategoryRequest.status)}</div>
                </div>
              </div>
              
              {selectedSubcategoryRequest.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedSubcategoryRequest.description}</p>
                </div>
              )}

              {selectedSubcategoryRequest.license_number && (
                <div>
                  <Label>License Number</Label>
                  <p className="text-sm font-mono">{selectedSubcategoryRequest.license_number}</p>
                </div>
              )}

              {selectedSubcategoryRequest.license_document_url && (
                <div>
                  <Label>License Document</Label>
                  <Button variant="outline" size="sm" asChild className="mt-1">
                    <a href={selectedSubcategoryRequest.license_document_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-1" />
                      View Document
                    </a>
                  </Button>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedSubcategoryRequest(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};