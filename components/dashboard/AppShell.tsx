"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  FileText,
  Users,
  Package,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  PieChart,
  Menu,
  X,
  Truck,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: LayoutDashboard, label: "Übersicht", href: "/dashboard" },
  { icon: FileText, label: "Rechnungen", href: "/invoices" },
  { icon: Users, label: "Kunden", href: "/customers" },
  { icon: Package, label: "Leistungen", href: "/products" },
  { icon: PieChart, label: "Berichte", href: "/reports" },
  { icon: Settings, label: "Einstellungen", href: "/settings" },
]

interface AppShellProps {
  user: { name?: string; email?: string } | null
  children: React.ReactNode
}

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative",
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 min-w-5" />
              {!collapsed && (
                <span className="whitespace-nowrap font-medium text-sm">
                  {item.label}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded-md text-sm shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap border border-border">
                  {item.label}
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="min-w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
        <Truck className="w-5 h-5" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="font-bold text-sm text-sidebar-foreground whitespace-nowrap">
            Yordanova Transport
          </p>
          <p className="text-[11px] text-sidebar-muted whitespace-nowrap">
            Rechnungssystem
          </p>
        </div>
      )}
    </div>
  )
}

function LogoutButton({ collapsed }: { collapsed: boolean }) {
  return (
    <form action="/api/auth/logout" method="POST" className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-sidebar-muted hover:bg-sidebar-accent hover:text-red-400 gap-3",
          collapsed && "justify-center px-0"
        )}
      >
        <LogOut className="w-5 h-5" />
        {!collapsed && <span>Abmelden</span>}
      </Button>
    </form>
  )
}

export function AppShell({ user, children }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const pathname = usePathname()

  // Drawer bei Routenwechsel schließen
  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      {/* Desktop-Sidebar */}
      <aside
        className={cn(
          "hidden md:flex relative h-full bg-sidebar flex-col z-20 transition-[width] duration-200",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-sidebar-accent">
          <Brand collapsed={collapsed} />
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-accent z-30"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>

        <NavLinks collapsed={collapsed} />

        <div className="p-3 border-t border-sidebar-accent">
          <LogoutButton collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile-Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-sidebar flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-accent">
              <Brand collapsed={false} />
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavLinks collapsed={false} onNavigate={() => setMobileOpen(false)} />
            <div className="p-3 border-t border-sidebar-accent">
              <LogoutButton collapsed={false} />
            </div>
          </aside>
        </div>
      )}

      {/* Hauptbereich */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10 px-4 md:px-6 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="md:hidden font-bold text-sm">
              Yordanova Transport
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/invoices/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Neue Rechnung</span>
                <span className="sm:hidden">Rechnung</span>
              </Button>
            </Link>

            <div className="h-8 w-px bg-border mx-1 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold border border-primary/20">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 pb-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
