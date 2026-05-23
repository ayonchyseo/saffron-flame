"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Users, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import { EmberParticles } from "@/components/three/EmberParticles";

const TIMES = [
  "18:00", "18:30", "19:00", "19:30", "20:00",
  "20:30", "21:00", "21:30", "22:00", "22:30",
];
const OCCASIONS = [
  "Dinner",
  "Anniversary",
  "Birthday",
  "Business",
  "Date night",
  "Special occasion",
];

export function Reservation() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // ISO date min/max — book today through 90 days ahead
  const { minDate, maxDate } = useMemo(() => {
    const t = new Date();
    const min = t.toISOString().slice(0, 10);
    const max = new Date(t.getTime() + 90 * 86400_000).toISOString().slice(0, 10);
    return { minDate: min, maxDate: max };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setSubmitting(true);
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Reservation failed");
      toast({
        variant: "gold",
        title: "Table held",
        description: `Confirmation ${json.code}. We've sent a note to ${data.email}.`,
      });
      form.reset();
    } catch (err: any) {
      toast({
        variant: "sang",
        title: "We couldn't hold the table",
        description: err?.message ?? "Please try again, or call +971 4 000 0000.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reserve" className="relative section overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-ember-radial opacity-20" />
      <EmberParticles count={20} seed={42} />

      <div className="container relative grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left — context */}
        <div className="lg:col-span-5">
          <p className="eyebrow">Chapter Five · Your Table</p>
          <h2 className="h-display text-fluid-md mt-3">
            We hold a few tables back, <em className="text-gold font-display italic not-italic">always.</em>
          </h2>
          <p className="mt-7 text-bone/70 leading-relaxed max-w-prose">
            Reserve a window seat, the counter, or the rooftop. For parties of six or
            more, our reservations team will follow up to design the evening with you.
          </p>

          <div className="mt-12 space-y-5">
            {[
              ["Service", "Sun–Thu 18:00 – 00:30 · Fri–Sat 17:00 – 01:30"],
              ["Dress code", "Smart elegant. No athletic wear after 19:00."],
              ["Children", "Welcome until 21:00."],
              ["Cancellation", "Free up to 24 hours before your reservation."],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[120px_1fr] gap-4 items-baseline">
                <span className="text-[0.6rem] uppercase tracking-widest2 text-gold/70">
                  {k}
                </span>
                <span className="text-sm text-bone/75">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 rule-gold" />

          <p className="mt-8 text-sm text-bone/65 leading-relaxed">
            Prefer to speak with us?{" "}
            <a
              href="tel:+97140000000"
              className="text-gold hover:text-gold-200 transition-colors"
              data-cursor="hover"
            >
              +971 4 000 0000
            </a>{" "}
            · daily 12:00 – 22:00.
          </p>
        </div>

        {/* Right — form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="lg:col-span-7 glass filigree-corners p-7 md:p-10"
        >
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your full name" required />
            </Field>

            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@domain.com"
                required
              />
            </Field>

            <Field>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+971 50 000 0000"
                required
              />
            </Field>

            <Field>
              <Label htmlFor="guests">
                <Users className="inline h-3 w-3 mr-1.5 -mt-0.5" />
                Guests
              </Label>
              <Select id="guests" name="guests" defaultValue="2" required>
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? "guest" : "guests"}
                  </option>
                ))}
                <option value="13+">Party of 13+ (we&apos;ll call)</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="date">
                <CalendarDays className="inline h-3 w-3 mr-1.5 -mt-0.5" />
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                min={minDate}
                max={maxDate}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="time">
                <Clock className="inline h-3 w-3 mr-1.5 -mt-0.5" />
                Time
              </Label>
              <Select id="time" name="time" defaultValue="20:00" required>
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>

            <Field className="sm:col-span-2">
              <Label htmlFor="occasion">
                <Sparkles className="inline h-3 w-3 mr-1.5 -mt-0.5" />
                Occasion (optional)
              </Label>
              <Select id="occasion" name="occasion" defaultValue="Dinner">
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </Field>

            <Field className="sm:col-span-2">
              <Label htmlFor="notes">Notes for the kitchen (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Allergies, dietary preferences, or anything else we should know."
                maxLength={500}
              />
            </Field>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[0.6rem] uppercase tracking-widest2 text-bone/40">
              No card hold · Confirmation by email
            </p>
            <Button type="submit" size="lg" variant="gold" disabled={submitting}>
              {submitting ? "Holding…" : "Confirm Reservation"}
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}

function Field({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className}>{children}</div>;
}
