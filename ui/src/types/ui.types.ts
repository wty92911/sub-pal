// ======== UI Component Types ========

import React from 'react';

// ======== Sidebar Types ========

export interface SidebarContextProps {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

// ======== Form Input Types ========

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

// ======== Calendar Types ========

export interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date | Date[] | { from: Date; to: Date };
  onSelect?: (date: Date | Date[] | { from: Date; to: Date } | undefined) => void;
  disabled?: boolean | ((date: Date) => boolean);
  className?: string;
}

// ======== Data Table Types ========

export interface DataTableProps<TData> {
  columns: any[]; // ColumnDef type from @tanstack/react-table
  data: TData[];
}

// ======== Toggle Types ========

export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

// ======== Generic Component Props ========

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface WithTooltipProps {
  tooltip?: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
}
