import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Sparkles, Users, Zap } from "lucide-react";
import { PageTransition } from "../components/layout/PageTransition";
import { Button } from "../components/ui/Button";
import { GlassCard } from "../components/ui/GlassCard";
import { Logo } from "../components/ui/Logo";
import { fadeUp, staggerContainer } from "../lib/motion";

const features = [
  { icon: Users, title: "Connect with referrers", desc: "Get introduced to top companies by employees who can vouch for you." },
  { icon: Shield, title: "Full visibility", desc: "Referrers review complete profiles to make informed referral decisions." },
  { icon: Zap, title: "Real-time chat", desc: "Message referrers directly once they express interest." },
  { icon: Sparkles, title: "Smart matching", desc: "Fuzzy filters find candidates by similar skills, roles, and experience." },
];

export default function Landing() {
  return (
    <PageTransition className="gradient-bg">
      <section className="relative overflow-hidden px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full blur-[120px]" style={{ background: "var(--gradient-hero-1)" }} />
          <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full blur-[100px]" style={{ background: "var(--gradient-hero-2)" }} />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-8">
              <Logo size="lg" />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme px-4 py-1.5 text-xs font-medium text-muted mb-8 glass">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              The modern way to get referred
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-theme leading-[1.1]">
              Land your dream job
              <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                through referrals
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Connect with employees at top companies who can refer you — or help talented candidates join your team.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register?role=seeker">
              <Button size="lg" className="min-w-[200px]">I need a referral <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link to="/register?role=referrer">
              <Button size="lg" variant="secondary" className="min-w-[200px]">I can refer</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-32 sm:px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeUp}>
              <GlassCard className="h-full">
                <feature.icon className="h-5 w-5 text-accent mb-4" />
                <h3 className="font-medium text-theme mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="px-4 pb-32 sm:px-6 lg:px-8">
        <GlassCard padding="lg" className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-theme mb-3">Ready to get started?</h2>
          <p className="text-muted mb-6">Join Refer Me and take the next step in your career.</p>
          <Link to="/register"><Button size="lg">Create free account <ArrowRight className="h-4 w-4" /></Button></Link>
        </GlassCard>
      </section>
    </PageTransition>
  );
}
