
import React, { useState } from 'react';
import { X, Timer, CreditCard, Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';

interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
  price: number;
  date: string;
}

interface Provider {
  id: number;
  name: string;
  services: string[];
  price: number;
}

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  timeSlots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  slotTimer: number | null;
  formatTime: (seconds: number) => string;
}

export const SlotBookingModal: React.FC<SlotBookingModalProps> = ({
  isOpen,
  onClose,
  provider,
  timeSlots,
  selectedSlot,
  onSlotSelect,
  slotTimer,
  formatTime
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [paymentStep, setPaymentStep] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  
  // Generate 15 days from today
  const availableDates = Array.from({ length: 15 }, (_, index) => addDays(new Date(), index));

  if (!isOpen || !provider) return null;

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      setBookingConfirmed(true);
    }, 2000);
  };

  const handleDownloadInvoice = () => {
    // Simulate invoice download
    const invoiceData = {
      bookingId: 'SNL' + Date.now(),
      provider: provider.name,
      service: provider.services[0],
      time: selectedSlot?.time,
      price: selectedSlot?.price,
      date: new Date().toLocaleDateString()
    };
    
    console.log('Downloading invoice:', invoiceData);
    alert('Invoice downloaded successfully!');
  };

  if (bookingConfirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose}></div>
        <div className="relative glass-strong rounded-3xl shadow-lg w-full max-w-md mx-4 animate-scale-in">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-h3 text-text-primary mb-4">Booking Confirmed!</h3>
            <p className="text-body text-text-secondary mb-6">
              Your service has been booked successfully. You will receive a confirmation email shortly.
            </p>
            <div className="space-y-4">
              <div className="bg-surface rounded-2xl p-4 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Service</span>
                    <span className="text-text-primary font-medium">{provider.services[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Provider</span>
                    <span className="text-text-primary font-medium">{provider.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Time</span>
                    <span className="text-text-primary font-medium">{selectedSlot?.time}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-text-primary">Total</span>
                    <span className="text-primary">${selectedSlot?.price}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownloadInvoice}
                className="w-full bg-primary/10 text-primary border border-primary/20 py-3 rounded-2xl font-medium hover:bg-primary/20 transition-colors"
              >
                Download Invoice
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-primary to-primary-hover text-primary-foreground py-3 rounded-2xl font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose}></div>
        <div className="relative glass-strong rounded-3xl shadow-lg w-full max-w-md mx-4">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-h3 text-text-primary">Payment</h3>
              <button onClick={() => setPaymentStep(false)} className="p-2 hover:bg-surface/50 rounded-xl">
                <X className="h-6 w-6 text-text-muted" />
              </button>
            </div>

            {/* Payment Summary */}
            <div className="bg-surface rounded-2xl p-6 mb-6">
              <h4 className="text-body font-semibold text-text-primary mb-4">Booking Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Service</span>
                  <span className="text-text-primary font-medium">{provider.services[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Time</span>
                  <span className="text-text-primary font-medium">{selectedSlot?.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Provider</span>
                  <span className="text-text-primary font-medium">{provider.name}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-body font-semibold">Total</span>
                  <span className="text-body font-bold text-primary">${selectedSlot?.price}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-small font-medium text-text-primary mb-2">Card Number</label>
                <input 
                  type="text" 
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-small font-medium text-text-primary mb-2">Expiry</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-small font-medium text-text-primary mb-2">CVV</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              className="w-full mt-6 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2"
            >
              <CreditCard className="h-5 w-5" />
              <span>Pay ${selectedSlot?.price}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative glass-strong rounded-3xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-h3 text-text-primary mb-2">Book Your Slot</h3>
              <p className="text-body text-text-secondary">{provider.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface/50 rounded-xl transition-all duration-200"
            >
              <X className="h-6 w-6 text-text-muted" />
            </button>
          </div>

          {/* Date Selection - 15 Day Calendar */}
          <div className="mb-6">
            <h4 className="text-h4 text-text-primary mb-4">Select Date</h4>
            <div className="bg-surface rounded-2xl border border-border p-4">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-small font-medium text-text-muted p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-xl border transition-all duration-200 text-center ${
                      isSameDay(selectedDate, date)
                        ? 'border-primary bg-primary/10 text-primary shadow-lg'
                        : 'border-border hover:border-primary/50 hover:bg-surface/50 text-text-primary'
                    }`}
                  >
                    <div className="text-small font-semibold">{format(date, 'd')}</div>
                    <div className="text-xsmall text-text-muted">{format(date, 'MMM')}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Available Slots */}
          <div className="space-y-6">
            <div>
              <h4 className="text-h4 text-text-primary mb-4">Available Time Slots</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && onSlotSelect(slot)}
                    disabled={!slot.available}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selectedSlot?.id === slot.id
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : slot.available
                        ? 'border-border hover:border-primary/50 hover:bg-surface/50'
                        : 'border-border/30 bg-surface/20 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="text-small font-semibold text-text-primary">{slot.time}</div>
                    <div className="text-xsmall text-text-muted">${slot.price}</div>
                    {!slot.available && (
                      <div className="text-xsmall text-error mt-1">Booked</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedSlot && (
              <div className="bg-surface rounded-2xl p-6 border border-primary/20 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-body font-semibold text-text-primary">Booking Summary</h5>
                  {slotTimer && (
                    <div className="flex items-center space-x-2 text-warning">
                      <Timer className="h-4 w-4" />
                      <span className="text-small font-mono">{formatTime(slotTimer)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Service</span>
                    <span className="text-text-primary font-medium">{provider.services[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Time</span>
                    <span className="text-text-primary font-medium">{selectedSlot.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Provider</span>
                    <span className="text-text-primary font-medium">{provider.name}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-body font-semibold">Total</span>
                    <span className="text-body font-bold text-primary">${selectedSlot.price}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setPaymentStep(true)}
                  className="w-full mt-6 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceed to Payment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
