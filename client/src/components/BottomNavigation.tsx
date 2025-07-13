import { useLocation } from "wouter";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home" },
    { path: "/quests", icon: "fas fa-scroll", label: "Quests" },
    { path: "/whistles", icon: "fas fa-trophy", label: "Whistles" },
    { path: "/session", icon: "fas fa-plus", label: "Climb", special: true },
    { path: "/progress", icon: "fas fa-chart-bar", label: "Progress" },
    { path: "/layers", icon: "fas fa-layer-group", label: "Layers" },
    { path: "/profile", icon: "fas fa-user", label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-abyss-purple/90 backdrop-blur-md border-t border-abyss-teal/20 z-30">
      <div className="flex items-center justify-around py-1 px-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center space-y-1 transition-colors px-0.5 ${
              item.special
                ? "relative"
                : isActive(item.path)
                ? "text-abyss-amber"
                : "text-abyss-ethereal/60 hover:text-abyss-amber"
            }`}
          >
            {item.special ? (
              <div className="w-8 h-8 bg-abyss-amber rounded-full flex items-center justify-center floating-animation abyss-glow">
                <i className={`${item.icon} text-abyss-dark text-xs`}></i>
              </div>
            ) : (
              <i className={`${item.icon} text-xs`}></i>
            )}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
