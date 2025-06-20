// src/components/layout/Header.tsx
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppSidebar } from './Layout'; // Import the hook for sidebar state

const Header = () => {
  const { user, logout } = useAuth();
  const { toggle } = useAppSidebar(); // Get the toggle function

  if (!user) return null;

  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  return (
      <header className={cn(
          "sticky top-0 z-30 px-4 sm:px-6 py-3", // Adjusted padding
          "bg-card border-b border-border text-card-foreground"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Hamburger Menu for Mobile */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={toggle}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>

            <img
                src="/logo/logo-header.png"
                alt="Arcadis Technologies"
                className="h-9 sm:h-10 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold bg-arcadis-gradient bg-clip-text text-transparent">
                Arcadis Space
              </h1>
              <p className="text-sm text-muted-foreground">Portail Client</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.role === 'admin' ? 'Administrateur' : user.companyName}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-arcadis-gradient text-white font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover border-border text-popover-foreground" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-popover-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                  <Link to="/profile" className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Mon Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
  );
};

export default Header;