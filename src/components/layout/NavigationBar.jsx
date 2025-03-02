import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Home, Droplets, Zap, ClipboardList, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const NavigationBar = () => {
  const navItems = [
    { to: '/', icon: <Home className="h-4 w-4" />, label: '首页' },
    { to: '/water-bill', icon: <Droplets className="h-4 w-4" />, label: '水费计算' },
    { to: '/electricity-bill', icon: <Zap className="h-4 w-4" />, label: '电费计算' },
    { to: '/history', icon: <ClipboardList className="h-4 w-4" />, label: '历史记录' },
  ];

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 mr-4">
          <div className="font-bold text-xl">租房日记</div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`
              }
            >
              {item.icon}
              <span className="ml-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="ml-auto">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors hover:bg-accent ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default NavigationBar;