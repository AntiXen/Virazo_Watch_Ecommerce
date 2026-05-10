import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
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
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Virazo Watch — Premium Luxury Watch Boutique" },
      { name: "description", content: "Authentic luxury watches from Rolex, Tissot, Seiko, G-Shock and more. Curated, certified, delivered to your door." },
      { name: "author", content: "Virazo Watch" },
      { property: "og:title", content: "Virazo Watch — Premium Luxury Watch Boutique" },
      { property: "og:description", content: "Authentic luxury watches from the world's most iconic brands." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

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