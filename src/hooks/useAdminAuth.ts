import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AdminProfile {
  id: string;
  user_id: string;
  department: 'suporte' | 'vendas' | 'administracao' | 'financeiro' | 'marketing';
  signature_type: 'department' | 'personal';
  custom_signature: string | null;
  display_name: string | null;
  is_active: boolean;
}

const DEPARTMENT_SIGNATURES: Record<string, string> = {
  suporte: '- Equipe Suporte Sofia 💜',
  vendas: '- Equipe Vendas Sofia 🎯',
  administracao: '- Administração Sofia ⚙️',
  financeiro: '- Equipe Financeiro Sofia 💰',
  marketing: '- Equipe Marketing Sofia 📢',
};

export const useAdminAuth = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError) {
          console.error('Error checking admin role:', roleError);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const hasAdminRole = !!roleData;
        setIsAdmin(hasAdminRole);

        if (hasAdminRole) {
          // Fetch admin profile
          const { data: profileData, error: profileError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching admin profile:', profileError);
          }

          setAdminProfile(profileData as AdminProfile | null);
        }
      } catch (error) {
        console.error('Error in admin auth check:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const getSignature = (): string => {
    if (!adminProfile) return '';

    if (adminProfile.signature_type === 'personal' && adminProfile.custom_signature) {
      return adminProfile.custom_signature;
    }

    if (adminProfile.signature_type === 'personal' && adminProfile.display_name) {
      const deptName = adminProfile.department.charAt(0).toUpperCase() + adminProfile.department.slice(1);
      return `- ${adminProfile.display_name} (${deptName})`;
    }

    return DEPARTMENT_SIGNATURES[adminProfile.department] || '';
  };

  const updateAdminProfile = async (updates: Partial<AdminProfile>) => {
    if (!user || !isAdmin) return { error: 'Not authorized' };

    const { data, error } = await supabase
      .from('admin_users')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setAdminProfile(data as AdminProfile);
    }

    return { data, error };
  };

  return {
    isAdmin,
    isLoading,
    adminProfile,
    getSignature,
    updateAdminProfile,
    DEPARTMENT_SIGNATURES,
  };
};
