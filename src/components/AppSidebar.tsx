/**
 * AppSidebar.tsx
 *
 * Main application sidebar with grouped navigation.
 * Features:
 * - Grouped navigation by category (Learn, Test, Analyze, Reference)
 * - Collapsible sections
 * - Active state highlighting
 * - Mobile responsive (sheet on mobile)
 * - Keyboard shortcut (Cmd/Ctrl + B)
 */

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Mic,
  FlaskConical,
  MessageSquare,
  BarChart3,
  Cpu,
  Package,
  LogOut,
  ChevronLeft,
  Activity,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface AppSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

// =============================================================================
// NAVIGATION CONFIGURATION
// =============================================================================

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Test',
    items: [
      {
        id: 'talk2bill',
        label: 'Talk2Bill',
        icon: MessageSquare,
        description: 'Full pipeline test',
      },
      {
        id: 'speech-to-text',
        label: 'Speech to Text',
        icon: Mic,
        description: 'Test STT models',
      },
      {
        id: 'playground-prompts',
        label: 'Playground',
        icon: FlaskConical,
        description: 'Test prompts',
      },
    ],
  },
  {
    label: 'Analyze',
    items: [
      {
        id: 'prod-insights',
        label: 'Prod Insights',
        icon: BarChart3,
        description: 'Production metrics',
      },
    ],
  },
  {
    label: 'Reference',
    items: [
      {
        id: 'data-science',
        label: 'Architecture',
        icon: Cpu,
        description: 'System design',
      },
      {
        id: 'product',
        label: 'Product',
        icon: Package,
        description: 'Prompts & specs',
      },
    ],
  },
  {
    label: 'Learn',
    items: [
      {
        id: 'how-vaani-works',
        label: 'How It Works',
        icon: BookOpen,
        description: 'Understand VAANI',
      },
    ],
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const AppSidebar: React.FC<AppSidebarProps> = ({
  currentPage,
  onPageChange,
  onLogout,
}) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-100">
        <div className={cn(
          "flex items-center gap-2 px-2 py-3",
          isCollapsed && "justify-center"
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <Activity className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-blue-600">VAANI</span>
              <span className="text-[10px] text-gray-500 -mt-1">LLM Arena</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-2">
        {NAV_GROUPS.map((group, groupIndex) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className={cn(
              "text-xs font-semibold text-gray-400 uppercase tracking-wider",
              isCollapsed && "sr-only"
            )}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = currentPage === item.id;
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onPageChange(item.id)}
                        isActive={isActive}
                        tooltip={isCollapsed ? item.label : undefined}
                        className={cn(
                          "w-full transition-all duration-200",
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4",
                          isActive ? "text-blue-600" : "text-gray-400"
                        )} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            {groupIndex < NAV_GROUPS.length - 1 && (
              <SidebarSeparator className="my-2" />
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-gray-100 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              tooltip={isCollapsed ? "Logout" : undefined}
              className="w-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
