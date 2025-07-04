// src/components/support/TicketCategoryDropdown.tsx
import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SafeSelectTrigger } from '@/components/ui/safe-triggers';
import { ticketCategoriesApi } from '@/services/api';
import { TicketCategory } from '@/types';
import { notificationManager } from '@/components/ui/notification-provider';

interface TicketCategoryDropdownProps {
  currentCategory: string | undefined;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
}

/**
 * Dropdown pour sélectionner ou modifier la catégorie d'un ticket
 */
const TicketCategoryDropdown: React.FC<TicketCategoryDropdownProps> = ({ 
  currentCategory, 
  onChange,
  disabled = false
}) => {
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categoriesData = await ticketCategoriesApi.getAll();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        notificationManager.error("Impossible de charger les catégories");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <Select
      value={currentCategory || ""}
      onValueChange={onChange}
      disabled={disabled || isLoading}
    >
      <SafeSelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Chargement..." : "Sélectionner une catégorie"} />
      </SafeSelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TicketCategoryDropdown;
