
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { List, Users, UserPlus, Settings, Menu, Upload, Download } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppShellClientProps {
  children: ReactNode;
}

export function AppShellClient({ children }: AppShellClientProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'All Contacts', icon: List },
    { href: '/groups', label: 'Groups', icon: Users }, // Renamed "Family Groups" to just "Groups"
    { href: '/contacts/add', label: 'Add Contact', icon: UserPlus },
    { href: '/?action=import', label: 'Import Contacts', icon: Upload, queryAction: true },
    { href: '/?action=export', label: 'Export Contacts', icon: Download, queryAction: true },
  ];

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> {/* Generic Icon */}
            <div>
              <h1 className="text-xl font-semibold text-primary">My-Contact</h1>
              <h2 className="text-xs font-medium text-primary/80">મારો સંપર્ક</h2>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href && !item.queryAction} 
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          {/* Footer content can be added here if needed in the future */}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <SidebarTrigger variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </SidebarTrigger>
             <Link href="/" className="flex items-center gap-2">
               <Users className="h-7 w-7 text-primary" /> {/* Generic Icon */}
               <div>
                <span className="text-lg font-semibold text-primary">My-Contact</span>
                <span className="block text-xs font-medium text-primary/80 -mt-1">મારો સંપર્ક</span>
               </div>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="user avatar"/>
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
