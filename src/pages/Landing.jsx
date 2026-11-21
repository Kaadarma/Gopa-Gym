import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '../lib/store';
import { config } from '../lib/config';
import { fmtRp } from '../lib/utils';
import Chatbot from '../components/Chatbot';
import ThemeToggle from '../components/ThemeToggle';
import { Brand } from '../components/Layout';

gsap.registerPlugin(ScrollTrigger);

// Fitur per tier mengikuti desain. Harga dan durasi diambil dari data paket (store).
const TIER_FEATURES = [
  ['Gym floor access', 'Locker room', 'Fitness assessment', '1 guest pass'],
  ['All group classes', 'Sauna & shower', '2 guest passes', 'Monthly PT session'],
  ['24/7 access', 'All classes + sauna', '4 PT sessions', 'Recovery zone'],
];

const FACILITIES = [
  { img: '/images/facility-strength.jpg', label: 'Strength zone' },
  { img: '/images/facility-cardio.jpg', label: 'Cardio & conditioning' },
  { img: '/images/facility-weights.jpg', label: 'Free weights' },
  { img: '/images/facility-recovery.jpg', label: 'Recovery' },
];

const MARQUEE = ['Fitness tips', 'Workout accessories', 'Nutrition guidance', 'Strength programs'];

const NAV = [
  ['Home', '#top'],
  ['About us', '#commitment'],
  ['Membership', '#membership'],
  ['Facilities', '#facilities'],
  ['Contact us', '#footer'],
];

function Eyebrow({ children }) {
  return <p data-reveal className="micro !text-lime">{children}</p>;
}

export default function Landing() {
  const { data } = useStore();
  const packages = data.packages.slice(0, 3);
  const rootRef = useRef(null);

  // Animasi GSAP. Dibungkus matchMedia agar otomatis mati untuk user dengan reduce motion.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const q = (sel) => root.querySelectorAll(sel);

      // 1. Intro hero
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from(q('[data-hero-eyebrow]'), { y: 16, opacity: 0, duration: 0.6 })
        .from(q('[data-hero-word]'), { yPercent: 110, duration: 1, stagger: 0.12 }, '-=0.3')
        .from(q('[data-hero-fade]'), { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.6')
        .from(q('[data-hero-img]'), { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power4.inOut' }, '-=1');

      // 2. Parallax ringan pada gambar hero saat di-scroll
      gsap.to(q('[data-parallax]'), {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: q('[data-hero-img]')[0], start: 'top bottom', end: 'bottom top', scrub: true },
      });

      // 3. Marquee berjalan tanpa henti
      gsap.to(q('[data-marquee]'), { xPercent: -50, duration: 25, ease: 'none', repeat: -1 });

      // 4. Section muncul saat di-scroll
      q('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      // 5. Kartu dalam grup muncul bergantian
      q('[data-reveal-group]').forEach((group) => {
        const items = gsap.utils.toArray(group.children);
        gsap.fromTo(
          items,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: group, start: 'top 92%', once: true },
          },
        );
      });

      // 6. Angka statistik naik dari 0
      q('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const counter = { v: 0 };
        gsap.to(counter, {
          v: end,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => {
            el.textContent = `${Math.round(counter.v)}${suffix}`;
          },
        });
      });
    });

    // Posisi trigger harus dihitung ulang setelah gambar dan font selesai dimuat,
    // jika tidak trigger di bawah fold bisa meleset.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    const t = setTimeout(refresh, 800);

    return () => {
      window.removeEventListener('load', refresh);
      clearTimeout(t);
      mm.revert();
    };
  }, []);

  return (
    <div ref={rootRef} id="top" className="min-h-screen overflow-x-hidden bg-base text-text">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-base/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Brand />
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map(([label, href]) => (
              <a key={label} href={href} className="micro transition hover:!text-lime">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="micro hidden transition hover:!text-lime sm:block">
              Login
            </Link>
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-full bg-lime px-5 text-xs font-semibold uppercase tracking-wider text-ink transition hover:-translate-y-0.5 hover:bg-limeBright"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:py-20">
        <div>
          <p data-hero-eyebrow className="micro flex items-center gap-3 !text-lime">
            <span className="h-px w-10 bg-lime" />
            Gopa Gym — Premium Fitness Club
          </p>
          <h1 className="mt-6 font-display text-[64px] uppercase leading-[0.86] md:text-[88px] xl:text-[112px]">
            {['Speak', 'Fitness', 'With your', 'Work'].map((word) => (
              <span key={word} className="block overflow-hidden">
                <span data-hero-word className="inline-block">
                  {word === 'Fitness' ? <span className="text-outline">{word}</span> : word}
                </span>
              </span>
            ))}
          </h1>
          <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
            <a
              href="#membership"
              className="inline-flex h-12 items-center rounded-full bg-lime px-7 font-condensed text-[15px] font-bold uppercase tracking-[0.09em] text-ink transition hover:-translate-y-0.5 hover:bg-limeBright"
            >
              Join now
            </a>
            <a
              href="#commitment"
              className="inline-flex h-12 items-center rounded-full border border-border bg-secondary px-7 font-condensed text-[15px] font-bold uppercase tracking-[0.09em] text-text transition hover:-translate-y-0.5 hover:border-lime/40"
            >
              Learn more
            </a>
          </div>
          <p data-hero-fade className="mt-6 max-w-md text-base leading-relaxed text-muted">
            Kelas, pelatih, dan alat terbaik untuk membangun kebiasaan sehat Anda setiap hari.
          </p>
          <p data-hero-fade className="mt-4 text-sm text-muted">
            No joining fee · Cancel anytime
          </p>

          <div data-hero-fade className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              ['200', '+', 'Expert trainers'],
              ['24/7', '', 'Classes weekly'],
              ['118', '+', 'Equipment'],
            ].map(([value, suffix, label]) => (
              <div key={label}>
                <p className="font-display text-[56px] leading-none text-lime" data-count={/^\d+$/.test(value) ? value : undefined} data-suffix={suffix}>
                  {value}
                  {suffix}
                </p>
                <p className="micro mt-1 text-[10px]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div data-hero-img className="relative">
          <div className="absolute -left-6 bottom-12 z-10 flex items-center gap-4 rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-2xl backdrop-blur">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime font-display text-lg text-ink">
              ✓
            </span>
            <div>
              <p className="font-display text-3xl leading-none text-text">4.9K+</p>
              <p className="micro mt-1 text-[10px]">Active members</p>
            </div>
          </div>
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl bg-lime" />
          <div className="relative overflow-hidden rounded-3xl">
            <img
              data-parallax
              src="/images/hero.jpg"
              alt="Athlete di Gopa Gym"
              className="aspect-[4/5] w-full scale-110 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden bg-lime py-4">
        <div data-marquee className="flex w-max whitespace-nowrap font-serif text-xl italic text-ink">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="px-8">
              {item} ✦
            </span>
          ))}
        </div>
      </div>

      {/* Commitment */}
      <section id="commitment" className="mx-auto max-w-7xl px-6 py-24">
        <Eyebrow>Our commitment · 02</Eyebrow>
        <h2 data-reveal className="mt-4 font-display text-[44px] uppercase sm:text-section-xl">
          Our commitment to your fitness
        </h2>
        <p data-reveal className="mt-6 max-w-2xl text-muted">
          Join our gym community and embark on a journey of unmatched fitness, health, and well-being. Guided by
          expert trainers and state-of-the-art facilities.
        </p>

        <div data-reveal-group className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-8 transition duration-300 hover:-translate-y-1 hover:border-lime/40">
            <p className="font-condensed text-pillar-title font-bold uppercase">The gym Gopa experience in your city</p>
            <p className="mt-4 text-sm text-muted">
              One membership, one standard. Expert coaching and equipment that is actually maintained.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 transition duration-300 hover:-translate-y-1 hover:border-lime/40">
            <p className="font-condensed text-pillar-title font-bold uppercase">Dedicated to your fitness success</p>
            <p className="mt-4 text-sm text-muted">
              Clear plans, honest progress tracking and a floor team that knows your name.
            </p>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-lime p-8 text-ink transition duration-300 hover:-translate-y-1">
            <p className="font-condensed text-[28px] font-bold uppercase leading-[30px]">The best gym equipment in your city</p>
            <p className="mt-8 text-xs font-semibold uppercase tracking-wider">42 stations · free weights · cardio</p>
          </div>
        </div>

        <div data-reveal-group className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            ['/images/functional.jpg', 'Functional zone'],
            ['/images/strength.jpg', 'Strength floor'],
          ].map(([src, label]) => (
            <div key={label} className="group relative overflow-hidden rounded-2xl">
              <img src={src} alt={label} className="h-72 w-full object-cover transition duration-700 group-hover:scale-105 md:h-96" />
              <span className="absolute bottom-4 left-4 rounded-full bg-base/90 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Eyebrow>By the numbers · 03</Eyebrow>
        <div data-reveal-group className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['520', '+', 'Workout sessions', 'Per month', 'bg-lime text-ink'],
            ['850', '+', 'Professional trainers', 'On the floor', 'bg-card text-text border border-border'],
            ['800', '+', 'Certified trainers', 'Across the network', 'bg-lime text-ink'],
          ].map(([value, suffix, label, sub, cls]) => (
            <div key={label} className={`rounded-2xl p-8 transition duration-300 hover:-translate-y-1 ${cls}`}>
              <p className="font-display text-stat-lg" data-count={value} data-suffix={suffix}>
                0{suffix}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider">{label}</p>
              <p className="mt-1 text-xs opacity-70">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Membership */}
      <section id="membership" className="mx-auto max-w-7xl px-6 pb-24">
        <Eyebrow>Membership · 04</Eyebrow>
        <h2 data-reveal className="mt-4 font-display text-[40px] uppercase sm:text-section-lg">
          Enjoy exclusive benefits
        </h2>
        <p data-reveal className="mt-4 text-muted">
          Three clear tiers. Every membership includes a fitness assessment and floor coaching.
        </p>

        <div data-reveal-group className="mt-12 grid gap-4 md:grid-cols-3">
          {packages.map((p, i) => {
            const featured = i === 1;
            return (
              <div
                key={p.id}
                className={`flex flex-col rounded-2xl border p-8 transition duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  featured ? 'border-lime bg-lime text-ink' : 'border-border bg-card hover:border-lime/40'
                }`}
              >
                <p className="font-condensed text-pkg-title font-bold uppercase">{p.name} membership</p>
                <p className={`mt-6 font-display text-price ${featured ? 'text-ink' : 'text-lime'}`}>{fmtRp(p.price)}</p>
                <p className={`mt-4 text-xs uppercase tracking-wider ${featured ? 'text-ink/70' : 'text-muted'}`}>
                  / {p.durationDays} hari
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-sm">
                  {(TIER_FEATURES[i] || TIER_FEATURES[0]).map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className={featured ? 'text-ink' : 'text-lime'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className={`mt-8 inline-flex h-12 items-center justify-center rounded-full font-condensed text-[15px] font-bold uppercase tracking-[0.09em] transition hover:-translate-y-0.5 ${
                    featured ? 'bg-ink text-[#A5E900]' : 'bg-lime text-ink hover:bg-limeBright'
                  }`}
                >
                  Join now →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="mx-auto max-w-7xl px-6 pb-24">
        <Eyebrow>Facilities · 05</Eyebrow>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h2 data-reveal className="font-display text-[40px] uppercase sm:text-section-lg">
            Modern equipment for every workout
          </h2>
          <p data-reveal className="max-w-sm text-muted">
            Four zones, one flow. Strength, cardio, functional training and recovery are planned so you never wait for
            a machine.
          </p>
        </div>
        <div data-reveal-group className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map((f) => (
            <div key={f.label} className="group relative overflow-hidden rounded-2xl">
              <img src={f.img} alt={f.label} className="h-72 w-full object-cover transition duration-500 group-hover:scale-110" />
              <span className="absolute bottom-3 left-3 rounded-full bg-base/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA + Footer */}
      <section className="relative overflow-hidden">
        <img src="/images/cta.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-base/70" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div data-reveal className="max-w-xl rounded-2xl bg-lime p-10 text-ink">
            <p className="micro !text-ink/60">Ready when you are</p>
            <h2 className="mt-3 font-display text-[40px] uppercase leading-[42px] sm:text-cta-title">Join our fitness community</h2>
            <p className="mt-4 text-sm">
              Start with a free assessment, meet the coaches and train on a plan built around your week.
            </p>
            <div data-reveal-group className="mt-8 grid grid-cols-3 gap-4 border-t border-ink/15 pt-6">
              {[
                ['260', '+', 'Group classes'],
                ['2.8', 'K', 'Happy members'],
                ['20', 'K+', 'Community'],
              ].map(([value, suffix, label]) => (
                <div key={label}>
                  <p className="font-display text-stat-md">
                    {value}
                    {suffix}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer id="footer" className="border-t border-border bg-base px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <Brand />
          <p className="text-sm text-muted">
            {config.gym.address} · {config.gym.email} · {config.gym.phone}
          </p>
          <p className="text-xs text-muted">© 2026 Gopa Gym. All rights reserved.</p>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}
