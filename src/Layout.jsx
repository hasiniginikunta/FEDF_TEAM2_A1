import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { motion } from "framer-motion";
import { LayoutDashboard, CreditCard, PieChart, Settings, Tag, LogOut } from "lucide-react";
import DarkModeToggle from "./Components/DarkmodeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "../Components/ui/sidebar";
import { Button } from "../Components/ui/button";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Transactions", url: createPageUrl("Transactions"), icon: CreditCard },
  { title: "Categories", url: createPageUrl("Categories"), icon: Tag },
  { title: "Reports", url: createPageUrl("Reports"), icon: PieChart },
  { title: "Settings", url: createPageUrl("Settings"), icon: Settings },
];

export default function Layout({ currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        {/* Sidebar */}
        <Sidebar className="border-border bg-card text-card-foreground shadow-xl">
          <SidebarHeader className="border-b border-border p-6">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center shadow-md">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">HisabKitab</h2>
                <p className="text-muted-foreground text-xs font-medium">Smart Budget Planner</p>
              </div>
            </motion.div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item, index) => (
                    <SidebarMenuItem key={item.title}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <SidebarMenuButton
                          asChild
                          className={`rounded-xl py-3 px-4 transition-all duration-200 ${
                            location.pathname === item.url
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </motion.div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4">
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full flex items-center justify-center">
                  <span className="text-card-foreground font-medium text-sm">
                    {user?.full_name?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-destructive hover:text-destructive-foreground rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </motion.div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="md:hidden">
                <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground p-2 rounded-lg transition-colors duration-200" />
              </div>
              <div className="flex items-center gap-2 md:flex-1">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center md:hidden">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h1 className="text-lg font-bold text-foreground md:hidden">HisabKitab</h1>
              </div>
              <div className="flex items-center gap-2">
                <DarkModeToggle />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <motion.div
              key={currentPageName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </div>

          {/* Mobile Bottom Nav */}
          <nav className="md:hidden bg-card border-t border-border px-4 py-2 shadow-lg">
            <div className="flex justify-around">
              {navigationItems.slice(0, 4).map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.url
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-lg ${
                      location.pathname === item.url
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-md'
                        : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span className="text-xs font-medium">{item.title}</span>
                </Link>
              ))}
            </div>
          </nav>
        </main>
      </div>
    </SidebarProvider>
  );
}
