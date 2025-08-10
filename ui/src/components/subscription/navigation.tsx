import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      active: location.pathname === '/dashboard',
    },
    {
      name: 'Add',
      href: '/subscriptions/new',
      icon: PlusCircle,
      active: location.pathname === '/subscriptions/new',
    },
    {
      name: 'Stats',
      href: '/statistics',
      icon: BarChart2,
      active: location.pathname === '/statistics',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur lg:hidden">
      <nav className="grid h-16 grid-cols-3">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex flex-col items-center justify-center space-y-1',
              item.active
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
