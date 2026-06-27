import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, PenTool, Image as ImageIcon, Search, Mail, BarChart3, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth";

export default function Landing() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (getToken()) {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const features = [
    { icon: PenTool, title: "Blog Articles", desc: "SEO-optimized long-form content tailored to your audience." },
    { icon: LayoutTemplate, title: "Social Media", desc: "Platform-specific posts for Twitter, LinkedIn, Instagram, and FB." },
    { icon: ImageIcon, title: "AI Images", desc: "Custom generated graphics to pair perfectly with your copy." },
    { icon: Search, title: "SEO Metadata", desc: "Titles, descriptions, and keywords ready to deploy." },
    { icon: Mail, title: "Newsletter", desc: "Engaging email campaigns to nurture your audience." },
    { icon: BarChart3, title: "Analytics", desc: "Track generations and manage your campaign history." },
  ];

  const steps = [
    { num: "01", title: "Create Campaign", desc: "Define your product, audience, and goal." },
    { num: "02", title: "AI Generates", desc: "Our engine crafts multi-platform content in seconds." },
    { num: "03", title: "Review Content", desc: "Edit, regenerate, and refine directly in the dashboard." },
    { num: "04", title: "Export", desc: "Download the complete campaign and publish." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            NovaContent AI
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/register">
              <Button className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none opacity-50" />
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-secondary/20 blur-[120px] rounded-full pointer-events-none opacity-40" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              The AI Marketing Command Center
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
              Generate Complete <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Marketing Campaigns
              </span> <br />
              in Seconds
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Stop writing platforms one by one. Describe your product once and NovaContent AI instantly creates blogs, social posts, newsletters, and custom graphics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl group w-full sm:w-auto">
                  Start Generating Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need, generated instantly</h2>
            <p className="text-muted-foreground">One prompt produces an entire ecosystem of marketing assets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all shadow-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How it works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-full h-[1px] bg-border" />
                )}
                <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-primary font-bold mb-6 relative z-10 shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to scale your content?</h2>
          <p className="text-xl text-muted-foreground mb-10">Join modern marketers building campaigns at the speed of thought.</p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 text-lg rounded-xl">
              Create Your First Campaign
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} NovaContent AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
