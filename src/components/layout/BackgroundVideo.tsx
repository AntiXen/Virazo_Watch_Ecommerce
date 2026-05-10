import { useRouterState } from "@tanstack/react-router";
// ১. ভিডিও ফাইলটি ইম্পোর্ট করুন
import bgVideo from "@/assets/Backgroundvid.mp4"; 

export function BackgroundVideo() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  // অ্যাডমিন প্যানেলে ভিডিও হাইড করার কন্ডিশন
  if (path.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-30" 
      >
        {/* ২. ইম্পোর্ট করা ভিডিও ফাইলটি এখানে বসান */}
        <source src={bgVideo} type="video/mp4" />
      </video>
      
      {/* একটি কালো ওভারলে যাতে উপরের লেখাগুলো স্পষ্ট বোঝা যায় */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}