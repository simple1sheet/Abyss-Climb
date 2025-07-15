import { useLocation } from "wouter";
import React from 'react';

// Custom hook (implementation not provided, assuming it checks screen size)
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768); // Example threshold
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home" },
    { path: "/quests", icon: "fas fa-campground", label: "Delver Tent" },
    { path: "/session", icon: "fas fa-plus", label: "Climb", special: true },
    { path: "/progress", icon: "fas fa-chart-bar", label: "Progress" },
    { path: "/profile", icon: "fas fa-user", label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <nav className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-abyss-purple/90 backdrop-blur-md border-t border-abyss-teal/20 z-30 ${isMobile ? 'h-20' : 'h-16'}`}>
      <div className={`flex items-center justify-around ${isMobile ? 'py-4' : 'py-3'} px-2`}>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center space-y-1 transition-colors touch-manipulation ${
              isMobile
                ? 'p-3 min-h-[60px] min-w-[60px]'
                : ''
            } ${
              item.special
                ? "relative"
                : isActive(item.path)
                ? "text-abyss-amber"
                : "text-abyss-ethereal/60 hover:text-abyss-amber active:bg-abyss-purple/40"
            }`}
          >
            {item.special ? (
              <div className="w-12 h-12 bg-abyss-amber rounded-full flex items-center justify-center floating-animation abyss-glow">
                <i className={`${item.icon} text-abyss-dark text-lg`}></i>
              </div>
            ) : (
              <i className={`${item.icon} ${isMobile ? 'text-xl' : 'text-lg'}`}></i>
            )}
            <span className={`text-xs ${isMobile ? 'text-xs' : ''}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}