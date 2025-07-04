// src/components/support/AdminAssignmentDropdown.tsx
import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SafeSelectTrigger } from '@/components/ui/safe-triggers';
import { supabase } from '@/lib/supabaseClient';
import { notificationManager } from '@/components/ui/notification-provider';

interface Admin {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface AdminAssignmentDropdownProps {
  currentAssignee: string | null;
  ticketId: string;
  onChange: (adminId: string | null) => void;
  disabled?: boolean;
}

/**
 * Dropdown pour assigner un administrateur à un ticket
 * Récupère la liste des administrateurs depuis la base de données
 */
const AdminAssignmentDropdown: React.FC<AdminAssignmentDropdownProps> = ({ 
  currentAssignee, 
  ticketId, 
  onChange,
  disabled = false
}) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        // Récupérer la liste des admins
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('role', 'admin');
          
        if (error) throw error;
        setAdmins(data || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des administrateurs:", error);
        notificationManager.error("Impossible de charger la liste des administrateurs");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdmins();
  }, []);
  
  return (
    <Select
      value={currentAssignee || "unassigned"}
      onValueChange={(value) => {
        const newValue = value === "unassigned" ? null : value;
        onChange(newValue);
      }}
      disabled={disabled || isLoading}
    >
      <SafeSelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Chargement..." : "Non assigné"} />
      </SafeSelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Non assigné</SelectItem>
        {admins.map((admin) => (
          <SelectItem key={admin.id} value={admin.id}>
            {admin.first_name} {admin.last_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AdminAssignmentDropdown;
