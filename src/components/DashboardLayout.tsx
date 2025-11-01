import { ReactNode, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradientText } from "@/components/GradientText";
import {
  LayoutDashboard,
  Settings,
  FileText,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Building2,
  PlusCircle,
  Target,
  Calculator,
  Activity,
  Wallet,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const { company, companies, setCurrentCompany } = useCompany();
  const { currentPlan, isTrial, daysUntilExpiry } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FileText, label: "Lançamentos", path: "/transactions" },
    { icon: TrendingUp, label: "Relatórios DRE", path: "/reports" },
    { icon: Activity, label: "Ponto de Equilíbrio", path: "/break-even" },
    { icon: Target, label: "Metas e Orçamento", path: "/goals" },
    { icon: Calculator, label: "Cenários", path: "/scenarios" },
    { icon: Wallet, label: "Caixa", path: "/cash-flow" },
    { icon: Settings, label: "Configurações", path: "/settings" },
    { icon: HelpCircle, label: "Ajuda", path: "/help" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getPlanBadgeVariant = () => {
    if (currentPlan === "infinity") return "default";
    if (currentPlan === "growth") return "secondary";
    return "outline";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <Link to="/dashboard" className="flex items-center gap-2">
                <h1 className="text-xl font-bold">
                  <GradientText>DRE INFINITY</GradientText>
                </h1>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Trial Badge */}
              {isTrial && daysUntilExpiry > 0 && (
                <Badge variant="outline" className="hidden md:flex text-primary border-primary">
                  Trial: {Math.ceil(daysUntilExpiry)} dias
                </Badge>
              )}

              {/* Plan Badge */}
              <Badge 
                variant={getPlanBadgeVariant()}
                className="hidden sm:flex cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate("/pricing")}
              >
                {currentPlan === "infinity" ? "Infinity" : currentPlan === "growth" ? "Growth" : "Functional"}
              </Badge>

              {/* Upgrade Button */}
              <Button
                onClick={() => navigate("/pricing")}
                size="sm"
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Upgrade</span>
              </Button>

              {/* Company Selector */}
              {company && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Building2 size={16} />
                      <span className="hidden md:inline">{company.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Empresas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {companies.map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        onClick={() => setCurrentCompany(c)}
                        className={company.id === c.id ? "bg-muted" : ""}
                      >
                        {c.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/company-setup")}>
                      <PlusCircle size={16} className="mr-2" />
                      Nova Empresa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut size={16} className="mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Toggle Button - External Floating */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-20 z-50 p-2.5 bg-gradient-to-br from-green-500 to-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
          sidebarOpen ? "left-[14.5rem]" : "left-4"
        } lg:flex hidden animate-in fade-in`}
      >
        {sidebarOpen ? (
          <X size={16} className="text-white transition-transform duration-300" />
        ) : (
          <Menu size={16} className="text-white transition-transform duration-300" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 glass border-r border-border/50 z-40 transition-all duration-300 ${
          sidebarOpen ? "w-56" : "w-0 lg:w-14"
        } overflow-hidden`}
      >
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs ${
                isActive(item.path)
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon size={16} className="shrink-0" />
              <span className={`${sidebarOpen ? "block" : "lg:hidden"}`}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "lg:ml-56" : "lg:ml-14"}`}>
        <div className="container mx-auto p-4 sm:p-6">{children}</div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
