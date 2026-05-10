import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/8801700000000?text=Hi%20LUXE%2C%20I%27m%20interested%20in%20a%20timepiece"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 group"
    >
      <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping" />
      <span className="relative grid place-items-center w-14 h-14 rounded-full bg-gradient-gold shadow-gold text-onyx group-hover:scale-110 transition-transform">
        <MessageCircle className="w-6 h-6" />
      </span>
    </a>
  );
}
