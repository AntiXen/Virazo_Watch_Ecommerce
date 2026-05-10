import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — LUXE Timepieces" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    
    setLoading(false);
    if (error) return toast.error(error.message);
    
    if (isSignUp) {
      toast.success("Account created! You can now sign in.");
      setIsSignUp(false);
    } else {
      toast.success("Welcome back");
      nav({ to: "/admin" });
    }
  };

  const google = async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" });
    if (r.error) toast.error(String((r.error as Error)?.message ?? r.error));
  };

  return (
    <div className="min-h-screen pt-24 pb-12 grid place-items-center container-luxe">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-luxe">
        <h1 className="font-display text-3xl gradient-gold-text">
          {isSignUp ? "Admin Registration" : "Admin Sign In"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isSignUp ? "Create your administrator account." : "Restricted to authorized administrators."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-onyx hover:brightness-110">
            {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-gold hover:underline uppercase tracking-wider"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>

        <div className="my-4 text-center text-xs text-muted-foreground">— or —</div>
        <Button variant="outline" onClick={google} className="w-full">Continue with Google</Button>
      </div>
    </div>
  );
}
