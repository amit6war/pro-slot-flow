
import React, { useState } from 'react';
import { Calendar, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProviderAvailability = () => {
  const [emergencyOffline, setEmergencyOffline] = useState(false);
  
  const weekDays = [
    { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', enabled: false, start: '10:00', end: '15:00' },
    { day: 'Sunday', enabled: false, start: '10:00', end: '15:00' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-text-primary font-bold mb-2">Availability Settings</h1>
        <p className="text-body text-text-secondary">
          Manage your working hours and availability for bookings.
        </p>
      </div>

      {/* Emergency Offline Toggle */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-h4 font-bold text-text-primary mb-2">Emergency Offline Mode</h3>
            <p className="text-body text-text-secondary">
              Temporarily stop accepting new bookings for emergencies or personal time.
            </p>
          </div>
          <button
            onClick={() => setEmergencyOffline(!emergencyOffline)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
              emergencyOffline
                ? 'bg-error/10 text-error border border-error/20'
                : 'bg-success/10 text-success border border-success/20'
            }`}
          >
            {emergencyOffline ? (
              <>
                <ToggleRight className="h-5 w-5" />
                <span>Offline</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-5 w-5" />
                <span>Online</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-surface rounded-2xl border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-h3 font-bold text-text-primary">Weekly Schedule</h3>
            <Button variant="outline" size="sm">
              Save Changes
            </Button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {weekDays.map((schedule, index) => (
            <div key={schedule.day} className="flex items-center justify-between p-4 bg-background rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">{schedule.day}</h4>
                  <p className="text-small text-text-muted">
                    {schedule.enabled ? `${schedule.start} - ${schedule.end}` : 'Closed'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {schedule.enabled && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-text-muted" />
                      <input
                        type="time"
                        value={schedule.start}
                        className="px-2 py-1 rounded-lg bg-surface border border-border text-text-primary text-small"
                      />
                    </div>
                    <span className="text-text-muted">to</span>
                    <input
                      type="time"
                      value={schedule.end}
                      className="px-2 py-1 rounded-lg bg-surface border border-border text-text-primary text-small"
                    />
                  </div>
                )}
                
                <button
                  className={`px-3 py-1 rounded-full text-xsmall font-medium border transition-all ${
                    schedule.enabled
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-error/10 text-error border-error/20'
                  }`}
                >
                  {schedule.enabled ? 'Available' : 'Closed'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <h3 className="text-h3 font-bold text-text-primary mb-4">Calendar View</h3>
        <div className="bg-background rounded-xl p-6 text-center">
          <Calendar className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-body text-text-muted">
            Interactive calendar coming soon. Manage specific dates and time slots.
          </p>
        </div>
      </div>
    </div>
  );
};
