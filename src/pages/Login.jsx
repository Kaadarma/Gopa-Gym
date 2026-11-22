import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { homeFor, useStore } from '../lib/store';
import { Brand } from '../components/Layout';
import { Button, Card, Field, Notice, inputCls } from '../components/ui';
import { config, demoAccounts } from '../lib/config';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { session, login } = useStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  if (session) return <Navigate to={homeFor(session.role)} replace />;

  const submit = (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    const res = login(form.email.trim(), form.password);
    if (!res.ok) setError(res.msg);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between p-10 lg:p-16">
        <div className="flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-secondary px-4 text-xs font-semibold uppercase tracking-wider text-muted transition hover:border-lime/40 hover:text-lime"
            >
              <span aria-hidden="true">←</span> Kembali
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-16 lg:mt-0">
          <h1 className="font-display text-7xl uppercase leading-[0.95] text-text">
            Speak fitness
            <br />
            with your <span className="text-lime">work</span>
          </h1>
          <p className="mt-6 max-w-md text-muted">
            Sistem manajemen membership Gopa Gym: data anggota, paket, check-in QR/barcode, transaksi, dan
            analisis untuk Owner.
          </p>
        </div>
        <p className="micro mt-12">Gopa Gym 2026</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <p className="micro">Masuk</p>
          <h2 className="mt-2 font-display text-4xl uppercase text-text">Selamat datang</h2>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                className={inputCls}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </Field>
            {error && <Notice ok={false}>{error}</Notice>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          {config.showDemoAccounts && (
            <div className="mt-8 border-t border-border pt-5">
              <p className="micro mb-3">Akun demo</p>
              <ul className="space-y-2 text-xs text-muted">
                {demoAccounts.map(({ label, email, password }) => (
                  <li key={label}>
                    <span className="text-text">{label}:</span> {email} / {password}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
