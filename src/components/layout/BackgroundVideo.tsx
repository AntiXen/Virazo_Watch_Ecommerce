import { useRouterState } from "@tanstack/react-router";

/**
 * PRODUCTION OPTIMIZED BACKGROUND VIDEO
 * Uses external streaming URL to keep the site bundle small and fast.
 */
export function BackgroundVideo() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  // Hide the video background entirely when in the Admin panel or Login pages
  const isAuthOrAdmin = path.startsWith("/admin") || path === "/login" || path === "/signup";
  
  if (isAuthOrAdmin) return null;

  const VIDEO_URL = "https://qehzoazkmgneeunqjsgc.supabase.co/storage/v1/object/public/assets/Backgroundvid.mp4";

  return (
    <div 
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" 
      aria-hidden="true"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-35"
        // Using preload="auto" to start loading the video immediately for a better user experience
        preload="auto"
      >
        <source src={VIDEO_URL} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* 
         Luxury dark overlay: Ensures that white text and golden buttons 
         are always readable regardless of what is happening in the video.
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}