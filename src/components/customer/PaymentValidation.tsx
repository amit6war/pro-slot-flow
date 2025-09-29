import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Phone, Mail, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { AddressManagement } from './AddressManagement';

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

interface ValidationData {
  name: string;
  email: string;
  phone: string;
  selectedAddress: Address | null;
}

interface PaymentValidationProps {
  isOpen: boolean;
  onClose: () => void;
  onValidationComplete: (data: ValidationData) => void;
}

export const PaymentValidation: React.FC<PaymentValidationProps> = ({
  isOpen,
  onClose,
  onValidationComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'info' | 'address'>('info');
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && isOpen) {
      loadUserData();
      loadDefaultAddress();
    }
  }, [user, isOpen]);

  const loadDefaultAddress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (data && !error) {
        setSelectedAddress(data);
      }
    } catch (error) {
      // No default address found, this is fine
      console.log('No default address found');
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, phone')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setFormData({
        name: data?.full_name || user?.user_metadata?.full_name || '',
        phone: data?.phone || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!user?.email) {
      newErrors.email = 'Email is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAddress = () => {
    if (!selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a service address",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleInfoNext = async () => {
    if (!validateForm()) return;

    // Update user profile with validated data
    if (user) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.name,
            phone: formData.phone,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile information",
          variant: "destructive"
        });
        return;
      } finally {
        setLoading(false);
      }
    }

    setCurrentStep('address');
  };

  const handleComplete = () => {
    if (!validateAddress()) return;

    const validationData: ValidationData = {
      name: formData.name,
      email: user?.email || '',
      phone: formData.phone,
      selectedAddress
    };

    onValidationComplete(validationData);
    onClose();
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const isInfoValid = formData.name.trim() && user?.email && formData.phone.trim() && Object.keys(errors).length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-text-primary">
            Confirm Your Details
          </DialogTitle>
          <p className="text-text-secondary">
            Please verify your information before proceeding to payment
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'info' ? 'bg-primary text-primary-foreground' : 
                isInfoValid ? 'bg-success text-white' : 'bg-surface text-text-muted'
              }`}>
                {isInfoValid && currentStep === 'address' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">1</span>
                )}
              </div>
              <span className={`font-medium ${
                currentStep === 'info' ? 'text-primary' : 
                isInfoValid ? 'text-success' : 'text-text-muted'
              }`}>
                Personal Info
              </span>
            </div>
            
            <div className={`w-16 h-0.5 ${
              isInfoValid ? 'bg-success' : 'bg-border'
            }`}></div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'address' ? 'bg-primary text-primary-foreground' : 
                selectedAddress ? 'bg-success text-white' : 'bg-surface text-text-muted'
              }`}>
                {selectedAddress ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">2</span>
                )}
              </div>
              <span className={`font-medium ${
                currentStep === 'address' ? 'text-primary' : 
                selectedAddress ? 'text-success' : 'text-text-muted'
              }`}>
                Service Address
              </span>
            </div>
          </div>

          {currentStep === 'info' && (
            <Card className="border-border bg-gradient-to-br from-white to-surface/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-text-primary">
                  <User className="h-5 w-5 text-primary" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-text-primary flex items-center space-x-1">
                      <span>Full Name</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) {
                          setErrors({ ...errors, name: '' });
                        }
                      }}
                      placeholder="Enter your full name"
                      className={`border-border focus:border-primary ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-text-primary flex items-center space-x-1">
                      <span>Email Address</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="pl-10 bg-surface border-border text-text-secondary"
                      />
                    </div>
                    <p className="text-xs text-text-muted">Email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-text-primary flex items-center space-x-1">
                      <span>Phone Number</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errors.phone) {
                            setErrors({ ...errors, phone: '' });
                          }
                        }}
                        placeholder="Enter your phone number"
                        className={`pl-10 border-border focus:border-primary ${
                          errors.phone ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="border-border text-text-secondary"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleInfoNext}
                    disabled={loading || !isInfoValid}
                    className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Next: Select Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'address' && (
            <Card className="border-border bg-gradient-to-br from-white to-surface/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-text-primary">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Service Address</span>
                </CardTitle>
                <p className="text-text-secondary">
                  Choose where you want the service to be provided
                </p>
              </CardHeader>
              <CardContent>
                <AddressManagement
                  showSelection={true}
                  selectedAddressId={selectedAddress?.id}
                  onAddressSelect={handleAddressSelect}
                />
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('info')}
                    className="border-border text-text-secondary"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleComplete}
                    disabled={!selectedAddress}
                    className="bg-gradient-to-r from-success to-success/80 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};