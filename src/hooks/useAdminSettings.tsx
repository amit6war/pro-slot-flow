import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const useAdminSettings = (key?: string) => {
  return useQuery({
    queryKey: key ? ['admin-settings', key] : ['admin-settings'],
    queryFn: async () => {
      const query = supabase.from('admin_settings').select('*');
      
      if (key) {
        query.eq('key', key).single();
      } else {
        query.order('key');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (key) {
        return (data as AdminSetting)?.value || {};
      }
      
      // Convert array to object with keys as properties
      const settings: Record<string, any> = {};
      if (Array.isArray(data)) {
        (data as AdminSetting[]).forEach((setting) => {
          settings[setting.key] = setting.value;
        });
      }
      
      return settings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
};