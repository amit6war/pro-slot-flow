import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CreditCard,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { ProviderBooking } from '@/hooks/useProviderBookings';

interface BookingDetailsModalProps {
  booking: ProviderBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkComplete?: (bookingId: string) => void;
  isMarkingComplete?: boolean;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onMarkComplete,
  isMarkingComplete = false
}) => {
  if (!booking) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success border border-success/20';
      case 'completed': return 'bg-primary/10 text-primary border border-primary/20';
      case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-warning/10 text-warning border border-warning/20';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-success/10 text-success border border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border border-warning/20';
      case 'failed': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-surface text-text-muted border border-border';
    }
  };

  // Parse customer info from both customer_info JSON and individual fields
  const customerEmail = booking.customer_info?.email || 'Not provided';
  const customerName = booking.customer_name || booking.customer_info?.name || 'Not provided';
  const customerPhone = booking.customer_phone || booking.customer_info?.phone || 'Not provided';
  const customerAddress = booking.customer_address || booking.customer_info?.address || 'Not provided';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-border shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-primary/5 to-primary/10 -m-6 mb-6 p-6 border-b border-border">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-text-primary">Booking Details</span>
            </div>
            <Badge className={`px-4 py-2 text-sm font-semibold ${getStatusColor(booking.status)}`}>
              {booking.status.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Service Information */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
            <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span>Service Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Service</span>
                    <p className="font-semibold text-text-primary">{booking.service_name}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Date</span>
                    <p className="font-semibold text-text-primary">{booking.booking_date}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Time</span>
                    <p className="font-semibold text-text-primary">{booking.booking_time}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Amount</span>
                    <p className="font-bold text-success text-lg">
                      {booking.currency?.toUpperCase() || 'USD'} {booking.total_amount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span>Customer Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-text-secondary">Customer Name</span>
                    <p className="font-semibold text-text-primary text-lg">{customerName}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-text-secondary">Email Address</span>
                    <p className="font-semibold text-text-primary break-all">{customerEmail}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-text-secondary">Phone Number</span>
                    <p className="font-semibold text-text-primary">{customerPhone}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-text-secondary">Service Address</span>
                    <p className="font-semibold text-text-primary">{customerAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span>Payment Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm text-text-secondary">Payment Status</span>
                      <p className="font-semibold text-text-primary">Status</p>
                    </div>
                  </div>
                  <Badge className={`px-3 py-1 ${getPaymentStatusColor(booking.payment_status)}`}>
                    {booking.payment_status?.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Total Amount</span>
                    <p className="font-bold text-success text-xl">
                      {booking.currency?.toUpperCase() || 'USD'} {booking.total_amount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {booking.special_instructions && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center space-x-2">
                <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span>Special Instructions</span>
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <p className="text-text-primary leading-relaxed">{booking.special_instructions}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-3 border-border text-text-secondary hover:bg-surface"
            >
              Close
            </Button>
            {booking.status === 'confirmed' && onMarkComplete && (
              <Button
                onClick={() => onMarkComplete(booking.id)}
                disabled={isMarkingComplete}
                className="px-6 py-3 bg-gradient-to-r from-success to-success/80 text-white hover:shadow-glow"
              >
                {isMarkingComplete ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Marking Complete...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};