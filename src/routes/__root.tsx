import { Outlet, Link, createRootRoute, useRouterState } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
// ১. ভিডিও কম্পোনেন্টটি ইম্পোর্ট করা হলো
import { BackgroundVideo } from "@/components/layout/BackgroundVideo"; 
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl gradient-gold-text">404</h1>
        <h2 className="mt-4 text-xl font-display text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded bg-gradient-gold px-6 py-3 text-sm font-semibold tracking-wider text-onyx shadow-gold hover:brightness-110 transition"
          >
            GO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isAdmin = path.startsWith("/admin");
  const isAuthPage = path === "/login" || path === "/signup";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* ২. ব্যাকগ্রাউন্ড ভিডিও: শুধুমাত্র ওয়েবসাইট পাথে দেখাবে */}
        {!isAdmin && !isAuthPage && <BackgroundVideo />}

        {!isAdmin && !isAuthPage && <Navbar />}
        
        <main className="min-h-screen relative">
          <Outlet />
        </main>

        {!isAdmin && !isAuthPage && <Footer />}
        {!isAdmin && !isAuthPage && <WhatsAppFab />}
        
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}