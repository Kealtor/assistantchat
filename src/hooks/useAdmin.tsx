import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/adminService';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || authLoading) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      const adminStatus = await adminService.isAdmin();
      setIsAdmin(adminStatus);
      setLoading(false);
    };

    checkAdminStatus();
  }, [user, authLoading]);

  return {
    isAdmin,
    loading: loading || authLoading,
    checkAdminStatus: async () => {
      if (!user) return false;
      const adminStatus = await adminService.isAdmin();
      setIsAdmin(adminStatus);
      return adminStatus;
    }
  };
};