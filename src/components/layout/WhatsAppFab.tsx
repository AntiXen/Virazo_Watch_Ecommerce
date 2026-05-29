import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function WhatsAppFab() {
  const [whatsapp, setWhatsapp] = useState("8801700000000"); // Default

  useEffect(() => {
    supabase
      .from("content_blocks")
      .select("value")
      .eq("key", "site_settings")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value && (data.value as any).whatsapp) {
          setWhatsapp((data.value as any).whatsapp);
        }
      });
  }, []);

  return (
    <a
      href={`https://wa.me/${whatsapp}?text=Hi%20Virazo%2C%20I%27m%20interested%20in%20a%20timepiece`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 group"
    >
      <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping" />
      <span className="relative grid place-items-center w-16 h-16 rounded-full bg-gradient-gold shadow-gold text-onyx group-hover:scale-110 transition-transform duration-500">
        <MessageCircle className="w-7 h-7" />
      </span>
    </a>
  );
}