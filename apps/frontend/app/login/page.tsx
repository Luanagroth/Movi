'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { ImmersiveHeader } from '@/components/immersive-header';
import { useAuthSession } from '@/hooks/use-auth-session';
import { DEFAULT_LOCALE, type UiLocale } from '@/lib/ui-copy';
import { loginWithEmail, registerWithEmail } from '@/services/auth/auth.service';
import { ApiRequestError } from '@/services/api/client';

type AuthMode = 'login' | 'register';
const heroImage = '/images/cityline/onibus.png';

const copy: Record<
  UiLocale,
  {
            back: string;
            accessTag: string;
            heroTitle: string;
    heroDescription: string;
    benefitOpen: string;
    benefitOpenDescription: string;
    benefitAccount: string;
    benefitAccountDescription: string;
    auth: string;
    loginTitle: string;
    registerTitle: string;
    loginTab: string;
    registerTab: string;
    name: string;
    yourName: string;
    email: string;
    phone: string;
    password: string;
    passwordHint: string;
    showPassword: string;
    hidePassword: string;
    processing: string;
    loginAction: string;
    registerAction: string;
    forgotPassword: string;
    recoverPasswordDescription: string;
    recoverPasswordAction: string;
    recoverPasswordSent: string;
    loadingSession: string;
    activeSession: string;
    alreadyConnected: string;
    currentAccount: string;
    backToDashboard: string;
    signOut: string;
    profileAction: string;
    favoritesAction: string;
    authFailed: string;
  }
> = {
  'pt-BR': {
    back: 'Voltar para o painel',
    accessTag: 'Acesso MOVI',
    heroTitle: 'Acesse sua conta MOVI.',
    heroDescription: 'O painel continua público para consulta de linhas e horários, mas com login você desbloqueia sincronização de favoritos e salvamento de localizações.',
    benefitOpen: 'Acesso sem travar o produto',
    benefitOpenDescription: 'A consulta de mobilidade continua aberta para qualquer pessoa.',
    benefitAccount: 'Conta pessoal',
    benefitAccountDescription: 'Favoritos e localizações ficam vinculados ao usuário autenticado.',
    auth: 'Autenticação',
    loginTitle: 'Entrar na sua conta',
    registerTitle: 'Criar conta MOVI',
    loginTab: 'Entrar',
    registerTab: 'Cadastrar',
    name: 'Nome',
    yourName: 'Seu nome',
    email: 'Email',
    phone: 'Telefone',
    password: 'Senha',
    passwordHint: 'Mínimo de 6 caracteres',
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
    processing: 'Processando...',
    loginAction: 'Entrar agora',
    registerAction: 'Criar conta',
    forgotPassword: 'Esqueci minha senha',
    recoverPasswordDescription: 'Informe e-mail e telefone para iniciar recuperação de senha.',
    recoverPasswordAction: 'Solicitar recuperação',
    recoverPasswordSent: 'Pedido registrado. Siga para contato e finalize a recuperacao.',
    loadingSession: 'Validando sua sessão...',
    activeSession: 'Sessao ativa',
    alreadyConnected: 'Você já está conectada',
    currentAccount: 'Conta atual',
    backToDashboard: 'Voltar ao painel',
    signOut: 'Sair da conta',
    profileAction: 'Meu perfil',
    favoritesAction: 'Meus favoritos',
    authFailed: 'Não foi possível concluir a autenticação.',
  },
  en: {
    back: 'Back to dashboard',
    accessTag: 'MOVI Access',
    heroTitle: 'Access your MOVI account.',
    heroDescription: 'The dashboard stays public for lines and schedules, but with login you unlock favorite sync and saved locations.',
    benefitOpen: 'Access without blocking the product',
    benefitOpenDescription: 'Mobility information remains open to everyone.',
    benefitAccount: 'Personal account',
    benefitAccountDescription: 'Favorites and saved locations stay linked to the authenticated user.',
    auth: 'Authentication',
    loginTitle: 'Sign in to your account',
    registerTitle: 'Create MOVI account',
    loginTab: 'Sign in',
    registerTab: 'Register',
    name: 'Name',
    yourName: 'Your name',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    passwordHint: 'At least 6 characters',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    processing: 'Processing...',
    loginAction: 'Sign in now',
    registerAction: 'Create account',
    forgotPassword: 'Forgot my password',
    recoverPasswordDescription: 'Enter email and phone number to start password recovery.',
    recoverPasswordAction: 'Request recovery',
    recoverPasswordSent: 'Request created. Go to contact to complete the recovery.',
    loadingSession: 'Checking your session...',
    activeSession: 'Active session',
    alreadyConnected: 'You are already connected',
    currentAccount: 'Current account',
    backToDashboard: 'Back to dashboard',
    signOut: 'Sign out',
    profileAction: 'My profile',
    favoritesAction: 'My favorites',
    authFailed: 'Could not complete authentication.',
  },
  es: {
    back: 'Volver al panel',
    accessTag: 'Acceso MOVI',
    heroTitle: 'Accede a tu cuenta MOVI.',
    heroDescription: 'El panel sigue publico para consultar lineas y horarios, pero con inicio de sesion desbloqueas favoritos y ubicaciones guardadas.',
    benefitOpen: 'Acceso sin bloquear el producto',
    benefitOpenDescription: 'La consulta de movilidad sigue abierta para cualquier persona.',
    benefitAccount: 'Cuenta personal',
    benefitAccountDescription: 'Favoritos y ubicaciones quedan vinculados al usuario autenticado.',
    auth: 'Autenticacion',
    loginTitle: 'Entrar en tu cuenta',
    registerTitle: 'Crear cuenta MOVI',
    loginTab: 'Entrar',
    registerTab: 'Registrar',
    name: 'Nombre',
    yourName: 'Tu nombre',
    email: 'Email',
    phone: 'Telefono',
    password: 'Contrasena',
    passwordHint: 'Minimo de 6 caracteres',
    showPassword: 'Mostrar contrasena',
    hidePassword: 'Ocultar contrasena',
    processing: 'Procesando...',
    loginAction: 'Entrar ahora',
    registerAction: 'Crear cuenta',
    forgotPassword: 'Olvide mi contrasena',
    recoverPasswordDescription: 'Ingresa email y telefono para iniciar la recuperacion.',
    recoverPasswordAction: 'Solicitar recuperacion',
    recoverPasswordSent: 'Solicitud registrada. Ve a contacto para finalizar la recuperacion.',
    loadingSession: 'Validando tu sesion...',
    activeSession: 'Sesion activa',
    alreadyConnected: 'Ya estas conectada',
    currentAccount: 'Cuenta actual',
    backToDashboard: 'Volver al panel',
    signOut: 'Salir de la cuenta',
    profileAction: 'Mi perfil',
    favoritesAction: 'Mis favoritos',
    authFailed: 'No fue posible completar la autenticacion.',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, logout, session, setSession } = useAuthSession();
  const [locale, setLocale] = useState<UiLocale>(DEFAULT_LOCALE);
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem('cityline:locale');
      if (storedLocale === 'pt-BR' || storedLocale === 'en' || storedLocale === 'es') {
        setLocale(storedLocale);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const modeParam = searchParams.get('modo');
    if (modeParam === 'cadastro' || modeParam === 'register') {
      setMode('register');
    }
  }, [searchParams]);

  const text = copy[locale];
  const title = useMemo(() => (mode === 'login' ? text.loginTitle : text.registerTitle), [mode, text]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const authSession =
        mode === 'login'
          ? await loginWithEmail({ email, password })
          : await registerWithEmail({ name, email, password, phone: phone.trim() || undefined });

      setSession(authSession);
      router.push('/');
      router.refresh();
    } catch (submitError) {
      if (submitError instanceof ApiRequestError) {
        setError(submitError.message);
      } else if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError(text.authFailed);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e6] px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-[#14233c]/10 bg-white px-5 py-4 text-sm text-[#14233c]/75 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-[#17803e]" />
          {text.loadingSession}
        </div>
      </main>
    );
  }

  if (isAuthenticated && session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e6] px-4 py-8">
        <section className="w-full max-w-xl rounded-3xl border border-[#14233c]/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 text-[#17803e]">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold">{text.activeSession}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-[#14233c]">{text.alreadyConnected}</h1>
          <p className="mt-2 text-sm text-[#14233c]/75">
            {text.currentAccount}: <strong>{session.user.name ?? session.user.email}</strong>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-[#17803e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#136a33]">
              <ArrowLeft className="h-4 w-4" />
              {text.backToDashboard}
            </Link>
            <Link href="/perfil" className="inline-flex items-center gap-2 rounded-xl border border-[#14233c]/20 px-4 py-2 text-sm font-semibold text-[#14233c] hover:bg-[#f5f1e6]">
              <UserRound className="h-4 w-4" />
              {text.profileAction}
            </Link>
            <Link href="/favoritos" className="inline-flex items-center gap-2 rounded-xl border border-[#14233c]/20 px-4 py-2 text-sm font-semibold text-[#14233c] hover:bg-[#f5f1e6]">
              {text.favoritesAction}
            </Link>
            <button type="button" onClick={() => logout()} className="rounded-xl border border-[#14233c]/20 px-4 py-2 text-sm font-semibold text-[#14233c] hover:bg-[#f5f1e6]">
              {text.signOut}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1e6] text-[#14233c] font-sans">
      <section className="mx-auto min-h-screen max-w-[1460px] overflow-hidden bg-[#f5f1e6] shadow-2xl lg:rounded-[28px]">
        <ImmersiveHeader />

        <section className="relative min-h-[700px] overflow-hidden">
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <Image src={heroImage} alt="Ônibus amarelo MOVI" fill className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e6] via-[#f5f1e6]/72 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e6]/35 via-transparent to-[#13100b]/10" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-[1280px] gap-8 px-8 pb-10 pt-32 lg:grid-cols-[1fr_420px] lg:items-center lg:px-12">
            <section>
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#14233c]/75 hover:text-[#14233c]">
                <ArrowLeft className="h-4 w-4" />
                {text.back}
              </Link>

              <p className="mt-6 text-sm font-black uppercase tracking-[0.24em] text-[#17803e]">{text.accessTag}</p>
              <h1 className="mt-3 text-4xl font-black leading-[0.98] tracking-normal text-[#10213d] sm:text-5xl lg:text-6xl">
                Acesse sua
                <br />
                <span className="text-[#16803f]">conta MOVI</span>
              </h1>
              <p className="mt-6 max-w-[560px] text-base font-medium leading-8 text-[#14233c]">{text.heroDescription}</p>

              <div className="mt-6 grid max-w-[640px] gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#14233c]/10 bg-white/75 p-4 shadow-sm">
                  <p className="text-sm font-black text-[#14233c]">{text.benefitOpen}</p>
                  <p className="mt-1 text-xs font-medium text-[#14233c]/70">{text.benefitOpenDescription}</p>
                </div>
                <div className="rounded-2xl border border-[#14233c]/10 bg-white/75 p-4 shadow-sm">
                  <p className="text-sm font-black text-[#14233c]">{text.benefitAccount}</p>
                  <p className="mt-1 text-xs font-medium text-[#14233c]/70">{text.benefitAccountDescription}</p>
                </div>
              </div>
            </section>

            <section className="w-full rounded-3xl border border-[#14233c]/10 bg-white/92 p-6 text-[#14233c] shadow-xl backdrop-blur sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2d6ca2]">{text.auth}</p>
                  <h2 className="text-xl font-black">{title}</h2>
                </div>
                <LogIn className="h-5 w-5 text-[#2d6ca2]" />
              </div>

              <div className="mb-4 flex gap-2 rounded-xl bg-[#f5f1e6] p-1">
                {(['login', 'register'] as const).map((currentMode) => (
                  <button
                    key={currentMode}
                    type="button"
                    onClick={() => {
                      setMode(currentMode);
                      setError(null);
                    }}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-black ${mode === currentMode ? 'bg-[#ffd200] text-[#14233c] shadow-sm' : 'text-[#14233c]/70'}`}
                  >
                    {currentMode === 'login' ? text.loginTab : text.registerTab}
                  </button>
                ))}
              </div>

              <form className="space-y-3" onSubmit={handleSubmit}>
                {mode === 'register' ? (
                  <label className="block text-sm">
                    <span className="mb-1 block font-bold text-[#14233c]">{text.name}</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-xl border border-[#14233c]/20 bg-white px-3 py-2 outline-none transition focus:border-[#17803e]"
                      placeholder={text.yourName}
                    />
                  </label>
                ) : null}

                {mode === 'register' ? (
                  <label className="block text-sm">
                    <span className="mb-1 block font-bold text-[#14233c]">{text.phone}</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="w-full rounded-xl border border-[#14233c]/20 bg-white px-3 py-2 outline-none transition focus:border-[#17803e]"
                      placeholder="(47) 99999-9999"
                    />
                  </label>
                ) : null}

                <label className="block text-sm">
                  <span className="mb-1 block font-bold text-[#14233c]">{text.email}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-xl border border-[#14233c]/20 bg-white px-3 py-2 outline-none transition focus:border-[#17803e]"
                    placeholder="você@exemplo.com"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-bold text-[#14233c]">{text.password}</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-[#14233c]/20 bg-white px-3 py-2 pr-11 outline-none transition focus:border-[#17803e]"
                      placeholder={text.passwordHint}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#14233c]/65 hover:bg-[#f5f1e6]"
                      aria-label={showPassword ? text.hidePassword : text.showPassword}
                      title={showPassword ? text.hidePassword : text.showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                {mode === 'login' ? (
                  <div className="pt-1">
                    <Link href="/esqueci-senha" className="text-xs font-bold uppercase tracking-[0.08em] text-[#2d6ca2] hover:underline">
                      {text.forgotPassword}
                    </Link>
                  </div>
                ) : null}

                {error ? <p className="rounded-xl bg-[#fff1ed] px-3 py-2 text-sm font-medium text-[#b42318]">{error}</p> : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd200] px-4 py-2.5 text-sm font-black text-[#14233c] transition hover:bg-[#eabf00] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  {submitting ? text.processing : mode === 'login' ? text.loginAction : text.registerAction}
                </button>
              </form>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
