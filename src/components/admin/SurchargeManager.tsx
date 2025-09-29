import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, DollarSign, Settings } from 'lucide-react';

interface SurchargeSettings {
  id: string;
  name: string;
  description: string;
  surcharge_amount: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export const SurchargeManager: React.FC = () => {
  const [settings, setSettings] = useState<SurchargeSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: 'Evening Surcharge',
    description: 'Additional charge for appointments after 5:00 PM',
    surcharge_amount: 100,
    start_time: '17:00',
    end_time: '20:00',
    is_active: true
  });

  useEffect(() => {
    loadSurchargeSettings();
  }, []);

  const loadSurchargeSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('surcharge_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setSettings(data);
        setFormData({
          name: data.name,
          description: data.description || '',
          surcharge_amount: data.surcharge_amount,
          start_time: data.start_time.substring(0, 5), // Remove seconds
          end_time: data.end_time.substring(0, 5),
          is_active: data.is_active
        });
      }
    } catch (error) {
      console.error('Error loading surcharge settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        surcharge_amount: formData.surcharge_amount,
        start_time: formData.start_time + ':00', // Add seconds
        end_time: formData.end_time + ':00',
        is_active: formData.is_active
      };

      let query;
      if (settings) {
        // Update existing
        query = supabase
          .from('surcharge_settings')
          .update(updateData)
          .eq('id', settings.id);
      } else {
        // Create new
        query = supabase
          .from('surcharge_settings')
          .insert(updateData);
      }

      const { error } = await query;

      if (error) throw error;

      toast({
        title: "Success",
        description: "Surcharge settings updated successfully"
      });

      loadSurchargeSettings();
    } catch (error) {
      console.error('Error saving surcharge settings:', error);
      toast({
        title: "Error",
        description: "Failed to save surcharge settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          Surcharge Management
        </h2>
        <p className="text-muted-foreground">
          Configure additional charges for evening appointments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Evening Surcharge Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="active">Enable Evening Surcharge</Label>
              <p className="text-sm text-muted-foreground">
                Apply additional charges for evening appointments
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.is_active}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_active: checked }))
              }
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Evening Surcharge"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Additional charge for appointments after 5:00 PM"
            />
          </div>

          {/* Surcharge Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Surcharge Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.surcharge_amount}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, surcharge_amount: Number(e.target.value) }))
              }
              placeholder="100"
              min="0"
              step="10"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, start_time: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                {formatTime12Hour(formData.start_time)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End Time
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, end_time: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                {formatTime12Hour(formData.end_time)}
              </p>
            </div>
          </div>

          {/* Preview */}
          {formData.is_active && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Preview</h4>
              <p className="text-sm text-muted-foreground">
                Appointments scheduled between{' '}
                <span className="font-medium text-foreground">
                  {formatTime12Hour(formData.start_time)}
                </span>{' '}
                and{' '}
                <span className="font-medium text-foreground">
                  {formatTime12Hour(formData.end_time)}
                </span>{' '}
                will have an additional charge of{' '}
                <span className="font-medium text-foreground">
                  ₹{formData.surcharge_amount}
                </span>
                .
              </p>
            </div>
          )}

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};