import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  FileImage,
  FolderKanban,
  Gauge,
  ImagePlus,
  Layers3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import {
  getGetAllContentQueryKey,
  getGetContentSummaryQueryKey,
  getGetHeroQueryKey,
  getGetMediaQueryKey,
  getGetProductQueryKey,
  getGetProductsQueryKey,
  getGetSectionQueryKey,
  getGetSectionsQueryKey,
  getGetSolutionQueryKey,
  getGetSolutionsQueryKey,
  useCreateProduct,
  useCreateSection,
  useCreateSolution,
  useDeleteMedia,
  useDeleteProduct,
  useDeleteSection,
  useDeleteSolution,
  useGetAllContent,
  useGetContentSummary,
  useGetHero,
  useGetMedia,
  useGetProduct,
  useGetProducts,
  useGetSection,
  useGetSections,
  useGetSolution,
  useGetSolutions,
  useLoginAdmin,
  useLogoutAdmin,
  useRegisterAdmin,
  useUpdateHero,
  useUpdateProduct,
  useUpdateSection,
  useUpdateSolution,
  useUploadMedia,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { clearStoredAuth, getStoredToken, setStoredAuth } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import './index.css';

const queryClient = new QueryClient();

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/dashboard/hero', label: 'Homepage hero', icon: Sparkles },
  { href: '/admin/dashboard/products', label: 'Products', icon: Package },
  { href: '/admin/dashboard/solutions', label: 'Solutions', icon: FolderKanban },
  { href: '/admin/dashboard/sections', label: 'Page sections', icon: Layers3 },
  { href: '/admin/dashboard/media', label: 'Media library', icon: FileImage },
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatDate(value?: string) {
  if (!value) return 'Not updated yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function ErrorState({ onRetry, label = 'Could not load this workspace' }: { onRetry: () => void; label?: string }) {
  return (
    <div className="panel flex min-h-[260px] flex-col items-center justify-center px-6 text-center" data-testid="state-error">
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive"><CircleAlert size={19} /></div>
      <h2 className="font-display text-lg font-semibold">{label}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">The signal dropped before we could bring this content in. Try the request again.</p>
      <button className="btn-secondary mt-5" onClick={onRetry} data-testid="button-retry"><RefreshCw size={14} /> Retry request</button>
    </div>
  );
}

function LoadingRows({ count = 4 }: { count?: number }) {
  return <div className="space-y-3" data-testid="state-loading">{Array.from({ length: count }).map((_, index) => <div className="panel flex items-center gap-4 p-4" key={index}><div className="skeleton size-11 shrink-0" /><div className="min-w-0 flex-1 space-y-2"><div className="skeleton h-3 w-1/3" /><div className="skeleton h-3 w-2/3" /></div><div className="skeleton h-8 w-20" /></div>)}</div>;
}

function Logo({ light = false, size = 'default' }: { light?: boolean; size?: 'default' | 'lg' }) {
  return (
    <Link href="/admin/dashboard" className="flex items-center" data-testid="link-logo">
      <img
        src={light ? '/voxa-logo.png' : '/voxa-logo-white.png'}
        alt="VOXA"
        className={cx(
          'w-auto object-contain object-left',
          size === 'lg' ? 'h-9 max-w-[220px]' : 'h-7 max-w-[168px]',
        )}
      />
    </Link>
  );
}

function Sidebar() {
  const [location] = useLocation();
  const logout = useLogoutAdmin();
  const [, setLocation] = useLocation();
  return (
    <aside className="desktop-sidebar fixed inset-y-0 left-0 z-30 flex w-[238px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground" data-testid="sidebar">
      <div className="flex h-[76px] items-center border-b border-sidebar-border px-6"><Logo /></div>
      <div className="px-4 pt-7">
        <p className="mb-3 px-2 font-mono-ui text-[9px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/45">Control room</p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? location === item.href : location.startsWith(item.href);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className={cx('group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors', active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground')} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={16} strokeWidth={active ? 2.3 : 1.8} /><span>{item.label}</span>{active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}</Link>;
          })}
        </nav>
      </div>
      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-md bg-sidebar-accent/55 px-3 py-2.5"><span className="flex size-8 items-center justify-center rounded-full bg-accent font-display text-xs font-bold text-accent-foreground">AM</span><div className="min-w-0"><p className="truncate text-xs font-semibold">Ari Morgan</p><p className="truncate font-mono-ui text-[9px] text-sidebar-foreground/45">admin · VOXA</p></div></div>
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={() => logout.mutate(undefined, { onSuccess: () => { clearStoredAuth(); setLocation('/admin/login'); } })} disabled={logout.isPending} data-testid="button-logout"><LogOut size={15} />{logout.isPending ? 'Signing out…' : 'Sign out'}</button>
      </div>
    </aside>
  );
}

function MobileTopbar({ onMenu }: { onMenu: () => void }) {
  return <header className="mobile-topbar h-16 items-center justify-between border-b border-border bg-card px-4"><button className="btn-quiet p-2" onClick={onMenu} data-testid="button-open-menu"><Menu size={19} /></button><Logo light /><span className="status-dot" /></header>;
}

function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="voxa-app noise-overlay"><Sidebar /><MobileTopbar onMenu={() => setOpen(true)} />{open && <div className="fixed inset-0 z-50 flex md:hidden"><div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} /><div className="relative w-[260px]"><Sidebar /><button className="absolute right-[-44px] top-4 rounded-md bg-card p-2 text-foreground" onClick={() => setOpen(false)} data-testid="button-close-menu"><X size={18} /></button></div></div>}<main className="min-h-[calc(100dvh-4rem)] md:ml-[238px] md:min-h-[100dvh]">{children}</main></div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p><h1 className="mt-2 font-display text-3xl font-semibold tracking-[-.045em] text-foreground md:text-[2.45rem]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>{action}</header>;
}

function TopLine({ label = 'Content operations' }: { label?: string }) {
  return <div className="mb-8 flex items-center justify-between border-b border-border pb-4"><div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground"><span className="status-dot" /> {label}</div><div className="font-mono-ui text-[10px] text-muted-foreground/70">LIVE / UTC</div></div>;
}

function StatCard({ label, value, caption, icon: Icon, accent }: { label: string; value: number | string; caption: string; icon: typeof Gauge; accent: string }) {
  return <div className="panel panel-hover relative overflow-hidden p-5" data-testid={`stat-${label.toLowerCase()}`}><div className={cx('absolute right-4 top-4 flex size-8 items-center justify-center rounded-md', accent)}><Icon size={16} /></div><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">{label}</p><p className="mt-5 font-display text-4xl font-semibold tracking-[-.06em]">{value}</p><p className="mt-2 text-xs text-muted-foreground">{caption}</p></div>;
}

function Dashboard() {
  const summaryQuery = useGetContentSummary();
  const allContentQuery = useGetAllContent();
  const summary = summaryQuery.data;
  const recent = allContentQuery.data ? [
    ...(allContentQuery.data.products || []).map((item) => ({ ...item, kind: 'Product' })),
    ...(allContentQuery.data.solutions || []).map((item) => ({ ...item, kind: 'Solution' })),
    ...(allContentQuery.data.sections || []).map((item) => ({ ...item, kind: 'Section' })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5) : [];
  return <div className="px-5 py-7 md:px-10 md:py-9"><TopLine /><PageHeader eyebrow="Workspace overview" title="Good morning, Ari." description="A quick read on the content surface. Keep the signal clear, then ship the next edit." action={<Link href="/admin/dashboard/hero" className="btn-primary" data-testid="link-edit-hero"><Sparkles size={15} /> Edit homepage hero</Link>} />
    {summaryQuery.isLoading ? <LoadingRows count={2} /> : summaryQuery.isError ? <ErrorState onRetry={() => summaryQuery.refetch()} /> : <div className="content-grid animate-rise"><StatCard label="Products" value={summary?.products ?? 0} caption="Published catalog items" icon={Package} accent="bg-primary/15 text-primary" /><StatCard label="Solutions" value={summary?.solutions ?? 0} caption="Use-case narratives" icon={FolderKanban} accent="bg-accent text-accent-foreground" /><StatCard label="Sections" value={summary?.sections ?? 0} caption="Modular page blocks" icon={Layers3} accent="bg-secondary text-secondary-foreground" /><StatCard label="Media" value={summary?.media ?? 0} caption="Available assets" icon={FileImage} accent="bg-primary/10 text-primary" /></div>}
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <section className="panel animate-rise delay-1 overflow-hidden" data-testid="section-recent-updates"><div className="flex items-center justify-between border-b border-card-border px-5 py-4"><div><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Activity stream</p><h2 className="mt-1 font-display text-xl font-semibold">Recent updates</h2></div><span className="rounded-full bg-muted px-2.5 py-1 font-mono-ui text-[9px] text-muted-foreground">{summary?.lastUpdated ? formatDate(summary.lastUpdated) : 'Syncing'}</span></div>{allContentQuery.isLoading ? <div className="p-5"><LoadingRows count={3} /></div> : allContentQuery.isError ? <div className="p-5"><ErrorState onRetry={() => allContentQuery.refetch()} label="Activity is unavailable" /></div> : recent.length === 0 ? <EmptyState icon={Archive} title="No updates in the stream" description="Create your first content item and it will appear here." /> : <div className="divide-y divide-card-border">{recent.map((item) => <Link href={item.kind === 'Product' ? `/admin/dashboard/products/${item.id}` : item.kind === 'Solution' ? `/admin/dashboard/solutions/${item.id}` : `/admin/dashboard/sections/${item.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60" key={`${item.kind}-${item.id}`} data-testid={`activity-${item.id}`}><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted font-mono-ui text-[10px] font-bold text-primary">{item.kind.slice(0, 2).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.name}</span><span className="mt-1 block text-xs text-muted-foreground">{item.kind} · updated {formatDate(item.updatedAt)}</span></span><ChevronRight size={15} className="text-muted-foreground" /></Link>)}</div>}</section>
      <section className="panel animate-rise delay-2 bg-secondary p-6 text-secondary-foreground" data-testid="section-publishing-note"><div className="flex items-start justify-between"><span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Gauge size={17} /></span><span className="font-mono-ui text-[9px] font-bold uppercase tracking-[.16em] opacity-55">Operator note</span></div><h2 className="mt-14 font-display text-2xl font-semibold leading-[1.05] tracking-[-.04em]">One edit away<br />from publishing.</h2><p className="mt-4 max-w-xs text-sm leading-6 opacity-65">VOXA keeps the important things close: the message, the asset, and the next action.</p><Link href="/admin/dashboard/products" className="mt-7 inline-flex items-center gap-2 text-xs font-bold underline decoration-primary underline-offset-4" data-testid="link-browse-products">Browse product catalog <ArrowUpRight size={14} /></Link></section>
    </div>
  </div>;
}

function EmptyState({ icon: Icon, title, description, action }: { icon: typeof Archive; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center justify-center px-6 py-16 text-center" data-testid="state-empty"><div className="mb-4 flex size-11 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground"><Icon size={20} /></div><h3 className="font-display text-lg font-semibold">{title}</h3><p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>{action}</div>;
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="relative block w-full md:w-[260px]"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input className="field-control pl-9" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} data-testid="input-search" /></label>;
}

function Inventory({ kind }: { kind: 'products' | 'solutions' | 'sections' }) {
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();
  const productsQuery = useGetProducts({ query: { enabled: kind === 'products', queryKey: getGetProductsQueryKey() } });
  const solutionsQuery = useGetSolutions({ query: { enabled: kind === 'solutions', queryKey: getGetSolutionsQueryKey() } });
  const sectionsQuery = useGetSections({ query: { enabled: kind === 'sections', queryKey: getGetSectionsQueryKey() } });
  const deleteProduct = useDeleteProduct();
  const deleteSolution = useDeleteSolution();
  const deleteSection = useDeleteSection();
  const data = kind === 'products' ? productsQuery.data : kind === 'solutions' ? solutionsQuery.data : sectionsQuery.data;
  const activeQuery = kind === 'products' ? productsQuery : kind === 'solutions' ? solutionsQuery : sectionsQuery;
  const label = kind === 'products' ? 'Products' : kind === 'solutions' ? 'Solutions' : 'Page sections';
  const singular = kind === 'products' ? 'product' : kind === 'solutions' ? 'solution' : 'section';
  const filtered = (data || []).filter((item) => `${item.name} ${'title' in item ? String(item.title) : ''} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  const remove = (id: string, name: string) => {
    if (!window.confirm(`Delete ${singular} “${name}”? This cannot be undone.`)) return;
    if (kind === 'products') deleteProduct.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetContentSummaryQueryKey() }); } });
    if (kind === 'solutions') deleteSolution.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetSolutionsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetContentSummaryQueryKey() }); } });
    if (kind === 'sections') deleteSection.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetContentSummaryQueryKey() }); } });
  };
  const createAction = !query ? <Link href={`/admin/dashboard/${kind}/new`} className="btn-secondary mt-5" data-testid={`link-empty-create-${singular}`}><Plus size={14} /> Create {singular}</Link> : undefined;
  return <div className="px-5 py-7 md:px-10 md:py-9">
    <TopLine label={`${label} / content index`} />
    <PageHeader eyebrow="Content inventory" title={label} description={`Manage the ${singular} layer that powers the public VOXA experience.`} action={<Link href={`/admin/dashboard/${kind}/new`} className="btn-primary" data-testid={`link-create-${singular}`}><Plus size={15} /> New {singular}</Link>} />
    <section className="panel overflow-hidden" data-testid={`panel-${kind}`}>
      <div className="flex flex-col gap-4 border-b border-card-border px-5 py-4 md:flex-row md:items-center md:justify-between"><div><p className="font-display text-lg font-semibold">All {label.toLowerCase()}</p><p className="mt-1 text-xs text-muted-foreground">{filtered.length} of {data?.length ?? 0} records shown</p></div><SearchBox value={query} onChange={setQuery} placeholder={`Search ${label.toLowerCase()}…`} /></div>
      {activeQuery.isLoading ? <div className="p-5"><LoadingRows count={4} /></div> : activeQuery.isError ? <div className="p-5"><ErrorState onRetry={() => activeQuery.refetch()} label={`${label} failed to load`} /></div> : filtered.length === 0 ? <EmptyState icon={kind === 'products' ? Package : kind === 'solutions' ? FolderKanban : Layers3} title={query ? 'No matching records' : `No ${singular}s yet`} description={query ? 'Try a shorter search or a different phrase.' : `Create a ${singular} to give this collection a clear point of view.`} action={createAction} /> : <div className="divide-y divide-card-border">{filtered.map((item, index) => <div className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/55" key={item.id} data-testid={`row-${singular}-${item.id}`}><div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-primary">{item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" /> : <span className="font-display text-lg font-semibold">{String(index + 1).padStart(2, '0')}</span>}</div><div className="min-w-0 flex-1"><Link href={`/admin/dashboard/${kind}/${item.id}`} className="block truncate text-sm font-semibold hover:text-primary" data-testid={`link-edit-${singular}-${item.id}`}>{item.name}</Link><p className="mt-1 truncate text-xs text-muted-foreground">{String('title' in item && item.title ? item.title : item.description)}</p></div><div className="hidden items-center gap-6 text-right sm:flex"><div><p className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-muted-foreground">Order</p><p className="mt-1 text-xs font-bold">{item.order}</p></div><div><p className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-muted-foreground">Updated</p><p className="mt-1 text-xs">{formatDate(item.updatedAt)}</p></div></div><div className="flex items-center gap-1"><Link href={`/admin/dashboard/${kind}/${item.id}`} className="btn-quiet p-2" data-testid={`button-open-${singular}-${item.id}`}><ArrowUpRight size={15} /></Link><button className="btn-quiet p-2 text-destructive hover:bg-destructive/10" onClick={() => remove(item.id, item.name)} data-testid={`button-delete-${singular}-${item.id}`}><Trash2 size={15} /></button></div></div>)}</div>}
    </section>
  </div>;
}

function Field({ label, value, onChange, placeholder, multiline = false, type = 'text', required = false, autoComplete }: { label: string; value: string | number; onChange: (value: string) => void; placeholder?: string; multiline?: boolean; type?: string; required?: boolean; autoComplete?: string }) {
  return <label className="block"><span className="field-label mb-2">{label}{required && <span className="ml-1 text-primary">*</span>}</span>{multiline ? <textarea className="field-control min-h-[120px] resize-y" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} data-testid={`input-${label.toLowerCase().replaceAll(' ', '-')}`} /> : <input className="field-control" type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} autoComplete={autoComplete} data-testid={`input-${label.toLowerCase().replaceAll(' ', '-')}`} />}</label>;
}

function EditorFrame({ eyebrow, title, backHref, children, onSave, saving, saveLabel = 'Save changes', error }: { eyebrow: string; title: string; backHref: string; children: ReactNode; onSave: () => void; saving: boolean; saveLabel?: string; error?: boolean }) {
  return <div className="px-5 py-7 md:px-10 md:py-9"><TopLine label="Editing mode" /><div className="mb-8 flex items-center gap-3"><Link href={backHref} className="btn-quiet -ml-2 p-2" data-testid="link-back"><ArrowLeft size={17} /></Link><div><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p><h1 className="mt-1 font-display text-3xl font-semibold tracking-[-.045em]">{title}</h1></div></div><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"><form className="space-y-5" onSubmit={(event) => { event.preventDefault(); onSave(); }}><div className="panel p-5 md:p-7">{children}</div>{error && <div className="flex items-center gap-2 rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-xs text-destructive" data-testid="status-save-error"><CircleAlert size={15} /> Could not save this version. Check the fields and try again.</div>}<div className="flex items-center justify-end gap-3"><Link href={backHref} className="btn-quiet" data-testid="button-cancel">Cancel</Link><button className="btn-primary min-w-[130px]" type="submit" disabled={saving} data-testid="button-save">{saving ? <><RefreshCw size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> {saveLabel}</>}</button></div></form><aside className="space-y-4"><div className="panel bg-secondary p-5 text-secondary-foreground"><p className="font-mono-ui text-[9px] font-bold uppercase tracking-[.16em] opacity-55">Publishing cue</p><p className="mt-4 font-display text-xl font-semibold leading-tight">Keep the message direct. The page does the rest.</p><p className="mt-3 text-xs leading-5 opacity-65">Changes are saved to the content API and reflected in the public experience on the next refresh.</p></div><div className="panel p-5"><div className="flex items-center gap-2 text-xs font-semibold"><span className="status-dot" /> Ready to edit</div><p className="mt-3 text-xs leading-5 text-muted-foreground">Use a clear title, one strong action, and an asset with enough room to breathe.</p></div></aside></div></div>;
}

function HeroEditor() {
  const queryClient = useQueryClient();
  const heroQuery = useGetHero();
  const update = useUpdateHero();
  const [form, setForm] = useState({ label: '', title: '', subtitle: '', ctaText: '', ctaUrl: '', imageUrl: '' });
  useEffect(() => { if (heroQuery.data) setForm({ label: heroQuery.data.label, title: heroQuery.data.title, subtitle: heroQuery.data.subtitle, ctaText: heroQuery.data.ctaText, ctaUrl: heroQuery.data.ctaUrl, imageUrl: heroQuery.data.imageUrl }); }, [heroQuery.data]);
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  if (heroQuery.isLoading) return <div className="px-5 py-7 md:px-10 md:py-9"><LoadingRows count={3} /></div>;
  if (heroQuery.isError) return <div className="px-5 py-7 md:px-10 md:py-9"><ErrorState onRetry={() => heroQuery.refetch()} label="Homepage hero failed to load" /></div>;
  return <EditorFrame eyebrow="Homepage surface" title="Homepage hero" backHref="/admin/dashboard" onSave={() => update.mutate({ data: form }, { onSuccess: (hero) => { queryClient.setQueryData(getGetHeroQueryKey(), hero); queryClient.invalidateQueries({ queryKey: getGetContentSummaryQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAllContentQueryKey() }); } })} saving={update.isPending} error={update.isError}><div className="mb-7 border-b border-border pb-5"><p className="font-display text-xl font-semibold">Lead with the signal</p><p className="mt-1 text-sm text-muted-foreground">This is the first message visitors see on voxa.com.</p></div><div className="space-y-5"><Field label="Eyebrow label" value={form.label} onChange={set('label')} placeholder="Built for the next move" required /><Field label="Headline" value={form.title} onChange={set('title')} placeholder="Make every launch sound like you." multiline required /><Field label="Supporting copy" value={form.subtitle} onChange={set('subtitle')} placeholder="A short, specific sentence that earns the next scroll." multiline /><div className="grid gap-4 sm:grid-cols-2"><Field label="CTA text" value={form.ctaText} onChange={set('ctaText')} placeholder="See the platform" /><Field label="CTA URL" value={form.ctaUrl} onChange={set('ctaUrl')} placeholder="/platform" /></div><Field label="Image URL" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" /></div></EditorFrame>;
}

function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const productQuery = useGetProduct(id || 'new', { query: { enabled: !isNew, queryKey: getGetProductQueryKey(id || 'new') } });
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const [form, setForm] = useState({ name: '', description: '', longDescription: '', imageUrl: '', order: '1', ctaText: '', ctaUrl: '' });
  useEffect(() => { if (productQuery.data) setForm({ name: productQuery.data.name, description: productQuery.data.description, longDescription: productQuery.data.longDescription, imageUrl: productQuery.data.imageUrl, order: String(productQuery.data.order), ctaText: productQuery.data.ctaText, ctaUrl: productQuery.data.ctaUrl }); }, [productQuery.data]);
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = () => { const data = { ...form, order: Number(form.order) || 1 }; if (isNew) create.mutate({ data }, { onSuccess: (item) => { queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetContentSummaryQueryKey() }); setLocation(`/admin/dashboard/products/${item.id}`); } }); else update.mutate({ id: id!, data }, { onSuccess: (item) => { queryClient.setQueryData(getGetProductQueryKey(id!), item); queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() }); } }); };
  if (!isNew && productQuery.isLoading) return <div className="px-5 py-7 md:px-10 md:py-9"><LoadingRows count={3} /></div>;
  if (!isNew && productQuery.isError) return <div className="px-5 py-7 md:px-10 md:py-9"><ErrorState onRetry={() => productQuery.refetch()} label="Product failed to load" /></div>;
  return <EditorFrame eyebrow={isNew ? 'New catalog record' : 'Product record'} title={isNew ? 'New product' : form.name || 'Edit product'} backHref="/admin/dashboard/products" onSave={save} saving={create.isPending || update.isPending} error={create.isError || update.isError} saveLabel={isNew ? 'Create product' : 'Save product'}><div className="mb-7 border-b border-border pb-5"><p className="font-display text-xl font-semibold">Product details</p><p className="mt-1 text-sm text-muted-foreground">Give this item a clear job in the VOXA catalog.</p></div><div className="space-y-5"><Field label="Product name" value={form.name} onChange={set('name')} placeholder="Signal Studio" required /><Field label="Short description" value={form.description} onChange={set('description')} placeholder="One sentence for cards and overview pages." multiline required /><Field label="Long description" value={form.longDescription} onChange={set('longDescription')} placeholder="The fuller story, proof points, and context." multiline /><div className="grid gap-4 sm:grid-cols-2"><Field label="Order" value={form.order} onChange={set('order')} type="number" /><Field label="Image URL" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="CTA text" value={form.ctaText} onChange={set('ctaText')} placeholder="Explore product" /><Field label="CTA URL" value={form.ctaUrl} onChange={set('ctaUrl')} placeholder="/products/signal-studio" /></div></div></EditorFrame>;
}

function SolutionEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const itemQuery = useGetSolution(id || 'new', { query: { enabled: !isNew, queryKey: getGetSolutionQueryKey(id || 'new') } });
  const create = useCreateSolution();
  const update = useUpdateSolution();
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '', order: '1' });
  useEffect(() => { if (itemQuery.data) setForm({ name: itemQuery.data.name, description: itemQuery.data.description, imageUrl: itemQuery.data.imageUrl, order: String(itemQuery.data.order) }); }, [itemQuery.data]);
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = () => { const data = { ...form, order: Number(form.order) || 1 }; if (isNew) create.mutate({ data }, { onSuccess: (item) => { queryClient.invalidateQueries({ queryKey: getGetSolutionsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetContentSummaryQueryKey() }); setLocation(`/admin/dashboard/solutions/${item.id}`); } }); else update.mutate({ id: id!, data }, { onSuccess: (item) => { queryClient.setQueryData(getGetSolutionQueryKey(id!), item); queryClient.invalidateQueries({ queryKey: getGetSolutionsQueryKey() }); } }); };
  if (!isNew && itemQuery.isLoading) return <div className="px-5 py-7 md:px-10 md:py-9"><LoadingRows count={3} /></div>;
  if (!isNew && itemQuery.isError) return <div className="px-5 py-7 md:px-10 md:py-9"><ErrorState onRetry={() => itemQuery.refetch()} label="Solution failed to load" /></div>;
  return <EditorFrame eyebrow={isNew ? 'New narrative' : 'Solution record'} title={isNew ? 'New solution' : form.name || 'Edit solution'} backHref="/admin/dashboard/solutions" onSave={save} saving={create.isPending || update.isPending} error={create.isError || update.isError} saveLabel={isNew ? 'Create solution' : 'Save solution'}><div className="mb-7 border-b border-border pb-5"><p className="font-display text-xl font-semibold">Solution details</p><p className="mt-1 text-sm text-muted-foreground">Frame the problem VOXA helps a team solve.</p></div><div className="space-y-5"><Field label="Solution name" value={form.name} onChange={set('name')} placeholder="Demand generation" required /><Field label="Description" value={form.description} onChange={set('description')} placeholder="A concise promise for this audience or use case." multiline required /><div className="grid gap-4 sm:grid-cols-2"><Field label="Order" value={form.order} onChange={set('order')} type="number" /><Field label="Image URL" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" /></div></div></EditorFrame>;
}

function SectionEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const itemQuery = useGetSection(id || 'new', { query: { enabled: !isNew, queryKey: getGetSectionQueryKey(id || 'new') } });
  const create = useCreateSection();
  const update = useUpdateSection();
  const [form, setForm] = useState({ name: '', title: '', description: '', imageUrl: '', videoUrl: '', order: '1' });
  useEffect(() => { if (itemQuery.data) setForm({ name: itemQuery.data.name, title: itemQuery.data.title, description: itemQuery.data.description, imageUrl: itemQuery.data.imageUrl, videoUrl: itemQuery.data.videoUrl, order: String(itemQuery.data.order) }); }, [itemQuery.data]);
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = () => { const data = { ...form, order: Number(form.order) || 1 }; if (isNew) create.mutate({ data }, { onSuccess: (item) => { queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetContentSummaryQueryKey() }); setLocation(`/admin/dashboard/sections/${item.id}`); } }); else update.mutate({ id: id!, data }, { onSuccess: (item) => { queryClient.setQueryData(getGetSectionQueryKey(id!), item); queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey() }); } }); };
  if (!isNew && itemQuery.isLoading) return <div className="px-5 py-7 md:px-10 md:py-9"><LoadingRows count={3} /></div>;
  if (!isNew && itemQuery.isError) return <div className="px-5 py-7 md:px-10 md:py-9"><ErrorState onRetry={() => itemQuery.refetch()} label="Section failed to load" /></div>;
  return <EditorFrame eyebrow={isNew ? 'New page block' : 'Section record'} title={isNew ? 'New section' : form.name || 'Edit section'} backHref="/admin/dashboard/sections" onSave={save} saving={create.isPending || update.isPending} error={create.isError || update.isError} saveLabel={isNew ? 'Create section' : 'Save section'}><div className="mb-7 border-b border-border pb-5"><p className="font-display text-xl font-semibold">Section details</p><p className="mt-1 text-sm text-muted-foreground">Build a modular moment for the page narrative.</p></div><div className="space-y-5"><Field label="Section name" value={form.name} onChange={set('name')} placeholder="Proof in motion" required /><Field label="Title" value={form.title} onChange={set('title')} placeholder="Make the work easier to see." required /><Field label="Description" value={form.description} onChange={set('description')} placeholder="Supporting copy for this section." multiline /><div className="grid gap-4 sm:grid-cols-2"><Field label="Order" value={form.order} onChange={set('order')} type="number" /><Field label="Image URL" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" /></div><Field label="Video URL" value={form.videoUrl} onChange={set('videoUrl')} placeholder="https://…" /></div></EditorFrame>;
}

function MediaPage() {
  const queryClient = useQueryClient();
  const mediaQuery = useGetMedia();
  const upload = useUploadMedia();
  const remove = useDeleteMedia();
  const [type, setType] = useState<'image' | 'video'>('image');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || !url.trim()) return; upload.mutate({ data: { name: name.trim(), type } }, { onSuccess: () => { setName(''); setUrl(''); queryClient.invalidateQueries({ queryKey: getGetMediaQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetContentSummaryQueryKey() }); } }); };
  const deleteAsset = (id: string, assetName: string) => { if (!window.confirm(`Delete “${assetName}” from the media library?`)) return; remove.mutate({ data: { id } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMediaQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetContentSummaryQueryKey() }); } }); };
  return <div className="px-5 py-7 md:px-10 md:py-9"><TopLine label="Media / asset library" /><PageHeader eyebrow="Asset library" title="Media" description="Keep the visual source of truth close to every content edit." /><div className="grid gap-5 lg:grid-cols-[1fr_310px]"><section className="panel overflow-hidden" data-testid="panel-media"><div className="flex items-center justify-between border-b border-card-border px-5 py-4"><div><p className="font-display text-lg font-semibold">All assets</p><p className="mt-1 text-xs text-muted-foreground">{mediaQuery.data?.length ?? 0} files available</p></div><span className="font-mono-ui text-[9px] uppercase tracking-[.14em] text-muted-foreground">Source files</span></div>{mediaQuery.isLoading ? <div className="p-5"><LoadingRows count={4} /></div> : mediaQuery.isError ? <div className="p-5"><ErrorState onRetry={() => mediaQuery.refetch()} label="Media library failed to load" /></div> : !mediaQuery.data?.length ? <EmptyState icon={FileImage} title="The library is quiet" description="Add an image or video URL to make it available in your content editors." /> : <div className="grid gap-3 p-4 sm:grid-cols-2">{mediaQuery.data.map((asset) => <div className="group overflow-hidden rounded-lg border border-border bg-background" key={asset.id} data-testid={`card-media-${asset.id}`}><div className="relative flex aspect-[1.55] items-center justify-center overflow-hidden bg-muted">{asset.type === 'video' ? <Video size={25} className="text-primary" /> : asset.url ? <img src={asset.url} alt={asset.name} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <FileImage size={25} className="text-primary" />}<span className="absolute left-2 top-2 rounded bg-secondary px-2 py-1 font-mono-ui text-[8px] font-bold uppercase text-secondary-foreground">{asset.type}</span><button className="absolute right-2 top-2 flex size-7 items-center justify-center rounded bg-background/90 text-destructive opacity-0 transition-opacity group-hover:opacity-100" onClick={() => deleteAsset(asset.id, asset.name)} data-testid={`button-delete-media-${asset.id}`}><Trash2 size={13} /></button></div><div className="p-3"><p className="truncate text-xs font-semibold">{asset.name}</p><p className="mt-1 font-mono-ui text-[9px] text-muted-foreground">{asset.size || 'URL asset'} · {formatDate(asset.createdAt)}</p></div></div>)}</div>}</section><section className="panel h-fit p-5" data-testid="panel-upload-media"><div className="mb-5 flex items-start justify-between"><div><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.14em] text-primary">Add to library</p><h2 className="mt-1 font-display text-xl font-semibold">Register an asset</h2></div><span className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary"><Upload size={17} /></span></div><form className="space-y-4" onSubmit={submit}><Field label="Asset name" value={name} onChange={setName} placeholder="launch-still-01" required /><Field label="Asset URL" value={url} onChange={setUrl} placeholder="https://…" required /><div><span className="field-label mb-2">Asset type</span><div className="grid grid-cols-2 gap-2">{(['image', 'video'] as const).map((item) => <button type="button" key={item} className={cx('rounded-md border px-3 py-2.5 text-xs font-semibold capitalize transition-colors', type === item ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted')} onClick={() => setType(item)} data-testid={`button-media-type-${item}`}>{item}</button>)}</div></div><button className="btn-primary w-full" type="submit" disabled={upload.isPending} data-testid="button-upload-media">{upload.isPending ? 'Registering…' : <><ImagePlus size={14} /> Register asset</>}</button>{upload.isError && <p className="text-xs text-destructive" data-testid="status-upload-error">Upload failed. Try again.</p>}</form><p className="mt-5 border-t border-border pt-4 text-[11px] leading-5 text-muted-foreground">The mock API stores the reference and metadata. Use a hosted URL to preview the asset here.</p></section></div></div>;
}

function Login() {
  const [, setLocation] = useLocation();
  const login = useLoginAdmin();
  const register = useRegisterAdmin();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@voxa.test');
  const [password, setPassword] = useState('voxa-admin');
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isRegister) {
      register.mutate({ data: { email, password } }, { onSuccess: () => setIsRegister(false) });
      return;
    }
    login.mutate({ data: { email, password } }, {
      onSuccess: (result) => {
        setStoredAuth(result.token, result.email);
        setLocation('/admin/dashboard');
      },
    });
  };
  const busy = login.isPending || register.isPending;
  return <div className="noise-overlay flex min-h-[100dvh] bg-background"><div className="hidden w-[46%] flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex"><Logo size="lg" /><div className="max-w-md"><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-primary">VOXA / content operations</p><h1 className="mt-5 font-display text-[4.5rem] font-semibold leading-[.91] tracking-[-.07em]">Make the next<br /><span className="text-sidebar-primary">move</span> visible.</h1><p className="mt-7 max-w-xs text-sm leading-6 text-sidebar-foreground/55">A focused workspace for the people shaping what the world hears next.</p></div><div className="flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[.14em] text-sidebar-foreground/40"><span className="status-dot" /> Secure workspace / v1.0</div></div><div className="flex flex-1 items-center justify-center px-5 py-10"><div className="w-full max-w-[400px] animate-rise"><div className="mb-10 lg:hidden"><Logo light /></div><div className="mb-8"><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary">{isRegister ? 'Create access' : 'Welcome back'}</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.06em]">{isRegister ? 'Set up the room.' : 'Back to the board.'}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{isRegister ? 'Create the mock admin account for this workspace.' : 'Sign in to keep the content signal moving.'}</p></div><form className="space-y-5" onSubmit={submit}><Field label="Email address" value={email} onChange={setEmail} type="email" autoComplete="email" required /><Field label="Password" value={password} onChange={setPassword} type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required /><button className="btn-primary w-full py-3" type="submit" disabled={busy} data-testid="button-login">{busy ? <><RefreshCw size={14} className="animate-spin" /> Working…</> : isRegister ? 'Create mock account' : 'Sign in to VOXA'} </button>{(login.isError || register.isError) && <div className="flex items-center gap-2 text-xs text-destructive" data-testid="status-login-error"><CircleAlert size={14} /> We could not verify those details. Try again.</div>}</form><div className="mt-7 flex items-center justify-between border-t border-border pt-5"><span className="text-xs text-muted-foreground">{isRegister ? 'Already have access?' : 'Need a mock account?'}</span><button className="text-xs font-bold text-primary hover:underline" onClick={() => setIsRegister((current) => !current)} data-testid="button-toggle-auth">{isRegister ? 'Sign in' : 'Register admin'}</button></div><p className="mt-8 text-center font-mono-ui text-[9px] uppercase tracking-[.12em] text-muted-foreground/65">Demo access is prefilled</p></div></div></div>;
}

function Router() {
  const [location] = useLocation();
  const isAuth = location === '/admin/login';
  const isAuthenticated = Boolean(getStoredToken());
  return <ErrorBoundary resetKey={location}>{isAuth || !isAuthenticated ? <Switch><Route path="/admin/login" component={Login} /><Route path="/" component={() => <Redirect to="/admin/login" />} /><Route component={() => <Redirect to="/admin/login" />} /></Switch> : <Shell><Switch><Route path="/" component={() => <Redirect to="/admin/login" />} /><Route path="/admin/login" component={Login} /><Route path="/admin/dashboard" component={Dashboard} /><Route path="/admin/dashboard/hero" component={HeroEditor} /><Route path="/admin/dashboard/products" component={() => <Inventory kind="products" />} /><Route path="/admin/dashboard/products/:id" component={ProductEditor} /><Route path="/admin/dashboard/solutions" component={() => <Inventory kind="solutions" />} /><Route path="/admin/dashboard/solutions/:id" component={SolutionEditor} /><Route path="/admin/dashboard/sections" component={() => <Inventory kind="sections" />} /><Route path="/admin/dashboard/sections/:id" component={SectionEditor} /><Route path="/admin/dashboard/media" component={MediaPage} /><Route component={NotFound} /></Switch></Shell>}</ErrorBoundary>;
}

function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation(to); }, [setLocation, to]);
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background"><div className="skeleton h-8 w-32" data-testid="state-redirect" /></div>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;