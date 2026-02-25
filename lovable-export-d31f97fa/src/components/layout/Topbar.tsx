import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { NotificationCenter } from "@/components/NotificationCenter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";

export function Topbar() {
  const { user, logout } = useAuth();
  const settingsPath = user?.role === "admin" ? "/admin" : "/app/settings";

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <span className="text-sm font-semibold text-primary">UpgradedProxy</span>
      </div>
      <div className="flex items-center gap-2">
        <CurrencySwitcher />
        <LanguageSwitcher />
        <NotificationCenter />
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden text-sm sm:inline">{user?.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={settingsPath} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2 text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}
