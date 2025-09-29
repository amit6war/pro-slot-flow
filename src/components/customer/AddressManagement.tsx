import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, MapPin, Edit3, Trash2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Address {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  user_id: string;
}

interface AddressManagementProps {
  onAddressSelect?: (address: Address) => void;
  selectedAddressId?: string;
  showSelection?: boolean;
}

export const AddressManagement: React.FC<AddressManagementProps> = ({
  onAddressSelect,
  selectedAddressId,
  showSelection = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load addresses from user_addresses table
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // If setting as default, first unset all other defaults
      if (formData.is_default) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const addressData = {
        user_id: user.id,
        name: formData.name,
        address_line_1: formData.address_line_1,
        address_line_2: formData.address_line_2 || null,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        is_default: formData.is_default
      };

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('user_addresses')
          .update(addressData)
          .eq('id', editingAddress.id);

        if (error) throw error;
      } else {
        // Create new address
        const { error } = await supabase
          .from('user_addresses')
          .insert([addressData]);

        if (error) throw error;
      }

      // Reload addresses
      await loadAddresses();
      
      resetForm();
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: editingAddress ? "Address updated successfully" : "Address added successfully",
      });
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      await loadAddresses();
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // First unset all defaults
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user!.id);

      // Then set the selected one as default
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      await loadAddresses();
      toast({
        title: "Success",
        description: "Default address updated",
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States',
      is_default: false
    });
    setEditingAddress(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-text-primary">
          {showSelection ? 'Select Service Address' : 'Manage Addresses'}
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-text-primary">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="name" className="text-text-primary">Address Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Home, Office, etc."
                    required
                    className="border-border focus:border-primary"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address_line_1" className="text-text-primary">Address Line 1 *</Label>
                  <Input
                    id="address_line_1"
                    value={formData.address_line_1}
                    onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                    placeholder="Street address"
                    required
                    className="border-border focus:border-primary"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address_line_2" className="text-text-primary">Address Line 2</Label>
                  <Input
                    id="address_line_2"
                    value={formData.address_line_2}
                    onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                    placeholder="Apartment, suite, etc. (optional)"
                    className="border-border focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-text-primary">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    required
                    className="border-border focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-text-primary">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State/Province"
                    required
                    className="border-border focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postal_code" className="text-text-primary">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="ZIP/Postal Code"
                    required
                    className="border-border focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-text-primary">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                    required
                    className="border-border focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                />
                <Label htmlFor="is_default" className="text-text-primary">Set as default address</Label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-border text-text-secondary"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && addresses.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : addresses.length === 0 ? (
        <Card className="border-border bg-surface">
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No addresses found</h3>
            <p className="text-text-secondary mb-6">Add your first address to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`border transition-all duration-200 hover:shadow-medium cursor-pointer ${
                showSelection && selectedAddressId === address.id
                  ? 'border-primary bg-primary/5 shadow-glow'
                  : 'border-border bg-white hover:border-primary/30'
              }`}
              onClick={() => showSelection && onAddressSelect?.(address)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary">{address.name}</h4>
                        {address.is_default && (
                          <Badge className="bg-success/10 text-success border-success/20">
                            Default
                          </Badge>
                        )}
                      </div>
                      {showSelection && selectedAddressId === address.id && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="text-text-secondary space-y-1">
                      <p>{address.address_line_1}</p>
                      {address.address_line_2 && <p>{address.address_line_2}</p>}
                      <p>{address.city}, {address.state} {address.postal_code}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                  
                  {!showSelection && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(address)}
                        className="border-border text-text-secondary hover:text-primary hover:border-primary/30"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="border-border text-text-secondary hover:text-red-600 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {!address.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          className="border-border text-text-secondary hover:text-primary hover:border-primary/30"
                        >
                          Set Default
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};