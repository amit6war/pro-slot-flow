
import React, { useState } from 'react';
import { CalendarDays, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { SimpleDateAvailability } from './SimpleDateAvailability';
import NotificationSettings from './NotificationSettings';

export const ProviderAvailability = () => {
  const [emergencyOffline, setEmergencyOffline] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly-schedule');
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-h2 font-bold text-text-primary">Schedule & Availability</h2>
            <p className="text-body text-text-muted mt-1">
              Simply click dates to mark them available or unavailable for booking
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-small text-text-muted">Status</p>
              <p className={`text-h4 font-bold ${
                emergencyOffline ? 'text-error' : 'text-success'
              }`}>
                {emergencyOffline ? 'Offline' : 'Online'}
              </p>
            </div>
            <Button
              variant={emergencyOffline ? 'destructive' : 'outline'}
              onClick={() => setEmergencyOffline(!emergencyOffline)}
              className="min-w-[120px]"
            >
              {emergencyOffline ? 'Go Online' : 'Go Offline'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly-schedule" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Weekly Schedule Tab */}
        <TabsContent value="weekly-schedule" className="space-y-6">
          <SimpleDateAvailability />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <NotificationSettings providerId={user?.id || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
