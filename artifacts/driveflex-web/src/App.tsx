'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, BadgeCheck, CalendarDays, CarFront, Check, CheckCircle2, ChevronLeft, CircleAlert, Clock3, Compass, Fuel, Heart, ImagePlus, LayoutDashboard, MapPin, Menu, MessageSquare, Navigation, Pencil, Phone, Plus, ShieldCheck, Sparkles, Star, UserCheck, UserRound, Users, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import logo from '@assets/WhatsApp_Image_2026-09-22_at_2.29.38_PM-removebg-preview_1790075154850.png';
import { availabilityLabel, vehicles, findVehicle, calculateRentalPrice, datesOverlap, type Vehicle } from '@/data/vehicles';
import { findOwner, findOwnerById, owners, type Owner, type OwnerType } from '@/data/owners';
import NotFound from '@/components/not-found';

const logoSrc = typeof logo === 'string' ? logo : logo.src;

const sessionKey = 'driveflex-demo-session';
const favoriteKey = 'driveflex-favorites';

type Session = { name: string; email: string };

function getSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(sessionKey) || 'null') as Session | null; } catch { return null; }
}
function setSession(value: Session | null) {
  if (value) localStorage.setItem(sessionKey, JSON.stringify(value));
  else localStorage.removeItem(sessionKey);
  window.dispatchEvent(new Event('driveflex-session'));
}
function useSession() {
  const [session, setValue] = useState<Session | null>(() => getSession());
  useEffect(() => {
    const sync = () => setValue(getSession());
    window.addEventListener('driveflex-session', sync);
    return () => window.removeEventListener('driveflex-session', sync);
  }, []);
  return session;
}
function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(favoriteKey) || '[]') as string[]; } catch { return []; }
  });
  const toggle = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(favoriteKey, JSON.stringify(next));
      return next;
    });
  };
  return { favorites, toggle };
}
function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | Drive Flex`;
    const meta = document.querySelector('meta[name="description"]') || document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', description);
    document.head.appendChild(meta);
  }, [title, description]);
}
function todayString() {
  return new Date().toISOString().slice(0, 10);
}
function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function useRouteSlug(prefix: string) {
  const pathname = usePathname() || '';
  const value = pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length + 1).split('/')[0] : '';
  return value ? decodeURIComponent(value) : '';
}

function useLocation(): readonly [string, (path: string) => void] {
  const pathname = usePathname() || '/';
  const router = useRouter();
  return [pathname, (path: string) => router.push(path)] as const;
}

const ownerProfileKey = 'driveflex-demo-owner-profile';
const publishedVehiclesKey = 'driveflex-demo-published-vehicles';
const demoBookingsKey = 'driveflex-demo-bookings';
type DemoOwnerProfile = Owner & { cnic: string; businessLocation: string };
type DemoBooking = { vehicleId: string; customer: string; pickup: string; returnDate: string; status: 'Confirmed' | 'Pending' };
function getDemoOwner(): DemoOwnerProfile | null {
  try { return JSON.parse(localStorage.getItem(ownerProfileKey) || 'null') as DemoOwnerProfile | null; } catch { return null; }
}
function getPublishedVehicles(): Vehicle[] {
  try { return JSON.parse(localStorage.getItem(publishedVehiclesKey) || '[]') as Vehicle[]; } catch { return []; }
}
function getDemoBookings(): DemoBooking[] {
  try { return JSON.parse(localStorage.getItem(demoBookingsKey) || '[]') as DemoBooking[]; } catch { return []; }
}
function ownerCars(ownerId: string) {
  const owner = findOwnerById(ownerId);
  const base = vehicles.filter((vehicle) => vehicle.ownerId === ownerId || owner?.vehicleIds.includes(vehicle.id));
  return [...base, ...getPublishedVehicles().filter((vehicle) => vehicle.ownerId === ownerId)];
}
function allCars() {
  return [...vehicles, ...getPublishedVehicles()];
}

function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = usePathname();
  const session = useSession();
  const navLinks = [['/', 'Fleet'], ['/about', 'About'], ['/contact', 'Contact']] as const;
  return (
    <div className="shell">
      <header className="nav">
        <div className="container nav-inner">
          <Link href="/" className="brand" data-testid="link-brand">
            <img src={logoSrc} alt="Drive Flex" />
            <span className="brand-wordmark">Drive <span>Flex</span></span>
          </Link>
          <nav className="nav-links" aria-label="Primary navigation">
            {navLinks.map(([href, label]) => <Link key={href} href={href} aria-current={location === href ? 'page' : undefined} data-testid={`link-nav-${label.toLowerCase()}`}>{label}</Link>)}
          </nav>
          <div className="nav-actions">
            {session ? <Link className="btn btn-outline btn-sm" href="/profile" data-testid="link-nav-profile"><UserRound size={14} /> Profile</Link> : <Link className="btn btn-ghost btn-sm" href="/sign-in" data-testid="link-nav-signin">Sign in</Link>}
            {!session && <Link className="btn btn-gold btn-sm" href="/register" data-testid="link-nav-register">Join Drive Flex</Link>}
          </div>
          <button className="nav-mobile-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} data-testid="button-mobile-menu">
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}>
          {navLinks.map(([href, label]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} data-testid={`link-mobile-${label.toLowerCase()}`}>{label}</Link>)}
          {session ? <Link href="/profile" onClick={() => setMenuOpen(false)} data-testid="link-mobile-profile">Profile</Link> : <><Link href="/sign-in" onClick={() => setMenuOpen(false)} data-testid="link-mobile-signin">Sign in</Link><Link href="/register" onClick={() => setMenuOpen(false)} data-testid="link-mobile-register">Join Drive Flex</Link></>}
        </div>
      </header>
      {children}
      <Footer />
    </div>
  );
}

function Footer() {
  return <footer className="footer">
    <div className="container footer-grid">
      <div><Link href="/" className="brand" data-testid="link-footer-brand"><img src={logoSrc} alt="Drive Flex" /><span className="brand-wordmark">Drive <span>Flex</span></span></Link><p>Premium cars. Powerful choices.<br />Simple booking.</p></div>
      <div><h3>Explore</h3><Link href="/">Browse fleet</Link><Link href="/about">Our story</Link><Link href="/owner/onboard">List your car</Link></div>
      <div><h3>Account</h3><Link href="/sign-in">Sign in</Link><Link href="/register">Create demo profile</Link><Link href="/profile">Profile</Link></div>
      <div><h3>Talk to us</h3><p>Monday — Friday<br />8:00 AM — 6:00 PM EST</p><Link href="/contact">Contact concierge <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /></Link></div>
    </div>
    <div className="container footer-bottom"><span>© 2026 Drive Flex Rental Car LLC</span><span>Frontend prototype — no real reservations or payments.</span></div>
  </footer>;
}

function FavoriteButton({ vehicle, favorites, toggle }: { vehicle: Vehicle; favorites: string[]; toggle: (id: string) => void }) {
  const active = favorites.includes(vehicle.id);
  return <button className={`icon-btn vehicle-favorite ${active ? 'is-favorite' : ''}`} onClick={() => toggle(vehicle.id)} aria-label={active ? `Remove ${vehicle.brand} ${vehicle.model} from favorites` : `Save ${vehicle.brand} ${vehicle.model} to favorites`} aria-pressed={active} data-testid={`button-favorite-${vehicle.id}`}>
    <Heart size={16} fill={active ? 'currentColor' : 'none'} />
  </button>;
}

function OwnerIdentity({ ownerId, compact = false }: { ownerId: string; compact?: boolean }) {
  const owner = findOwnerById(ownerId) || getDemoOwner();
  if (!owner) return null;
  return <Link className={`owner-identity ${compact ? 'owner-identity-compact' : ''}`} href={`/owners/${owner.slug}`} aria-label={`View ${owner.businessName} owner profile`} data-testid={`link-owner-${ownerId}`}>
    <img src={owner.logoImage || owner.profileImage} alt={`${owner.businessName} profile`} />
    <span><strong>{owner.businessName}</strong><small><BadgeCheck size={12} /> Verified Owner</small></span>
  </Link>;
}

function AvailabilityPill({ vehicle, pickup = '', returnDate = '' }: { vehicle: Vehicle; pickup?: string; returnDate?: string }) {
  const label = availabilityLabel(vehicle, pickup, returnDate);
  const unavailable = label !== 'Available';
  return <span className={`availability-pill ${unavailable ? 'is-unavailable' : ''}`} data-testid={`status-availability-${vehicle.id}`}><CheckCircle2 size={13} /> {label}</span>;
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { favorites, toggle } = useFavorites();
  return <article className="vehicle-card" data-testid={`card-vehicle-${vehicle.id}`}>
    <div className="vehicle-image">
      <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} loading="lazy" />
      {vehicle.category === 'Luxury' && <span className="vehicle-badge">Premium</span>}
      <FavoriteButton vehicle={vehicle} favorites={favorites} toggle={toggle} />
    </div>
    <div className="vehicle-body">
      <div className="vehicle-category">{vehicle.category}</div>
      <h3 className="vehicle-title">{vehicle.brand} {vehicle.model}</h3>
      <div className="vehicle-meta"><span><MapPin size={13} /> {vehicle.location}</span><span className="rating"><Star size={12} fill="currentColor" /> {vehicle.rating}</span><span><Users size={13} /> {vehicle.seats}</span></div>
       <AvailabilityPill vehicle={vehicle} />
       <OwnerIdentity ownerId={vehicle.ownerId} compact />
      <div className="vehicle-bottom"><div className="price">{formatMoney(vehicle.pricePerDay)} <small>/ day</small></div><Link className="btn btn-outline btn-sm" href={`/cars/${vehicle.slug}`} data-testid={`link-view-car-${vehicle.id}`}>View car</Link></div>
    </div>
  </article>;
}

function SearchPanel({ onResults }: { onResults: (items: Vehicle[], message: string) => void }) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!pickup || !dropoff) return setError('Choose both a pickup and return location.');
    if (!start || !end) return setError('Select pickup and return dates to check availability.');
    if (start < todayString()) return setError('Pickup date must be today or later.');
    if (end <= start) return setError('Return date must be after pickup date.');
    const results = allCars().filter((vehicle) => (vehicle.location.toLowerCase().includes(pickup.toLowerCase()) || pickup.toLowerCase() === 'anywhere') && (vehicle.location.toLowerCase().includes(dropoff.toLowerCase()) || dropoff.toLowerCase() === 'anywhere') && !datesOverlap(vehicle, start, end));
    onResults(results, results.length ? `${results.length} vehicles match your route and dates.` : 'No vehicles match those dates yet. Try another city or a wider window.');
    document.getElementById('fleet-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return <form className="search-panel container-wide" onSubmit={submit} noValidate>
    <div className="search-top"><span className="eyebrow">Find your next drive</span><span>Availability checked in real time — demo data</span></div>
    <div className="search-grid">
      <div className="field"><label htmlFor="pickup-location">Pickup location</label><input id="pickup-location" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="City or airport" data-testid="input-pickup-location" /></div>
      <div className="field"><label htmlFor="dropoff-location">Return location</label><input id="dropoff-location" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Same city or another" data-testid="input-dropoff-location" /></div>
      <div className="field"><label htmlFor="pickup-date">Pickup date</label><input id="pickup-date" type="date" min={todayString()} value={start} onChange={(e) => setStart(e.target.value)} data-testid="input-pickup-date" /></div>
      <div className="field"><label htmlFor="return-date">Return date</label><input id="return-date" type="date" min={start || todayString()} value={end} onChange={(e) => setEnd(e.target.value)} data-testid="input-return-date" /></div>
      <div className="search-submit"><button className="btn btn-primary" type="submit" data-testid="button-find-cars"><Compass size={15} /> Find cars</button></div>
    </div>
    {error && <div className="search-error" role="alert" data-testid="error-search">{error}</div>}
  </form>;
}

function Home() {
  usePageMeta('Premium car rental marketplace', 'Drive Flex connects you with premium, verified cars and simple booking.');
  const [results, setResults] = useState<Vehicle[] | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  return <Layout>
    <main>
      <section className="hero">
        <div className="hero-mark">Move with confidence / 2026</div>
        <div className="container hero-content">
          <div className="eyebrow">The Drive Flex standard</div>
          <h1>Find a car<br />with <em>character.</em></h1>
          <p className="hero-copy">Premium cars, trusted hosts, and a clearer way to move. Choose the drive that makes the destination feel closer.</p>
           <div className="hero-actions"><a className="btn btn-gold" href="#fleet-results" data-testid="link-hero-find-cars">Explore the fleet <ArrowRight size={15} /></a><Link className="btn btn-outline" href="/owner/onboard" data-testid="link-hero-list-car">List your car</Link></div>
        </div>
      </section>
      <SearchPanel onResults={(items, message) => { setResults(items); setResultMessage(message); }} />
      <section className="section" id="fleet-results">
        <div className="container">
          <div className="section-heading"><div><div className="eyebrow">Curated, not crowded</div><h2>{results ? 'Your route, matched.' : 'A better way to choose your drive.'}</h2></div><p>{results ? resultMessage : 'From the first key turn to the last mile, every vehicle in our marketplace earns its place.'}</p></div>
          {results && results.length === 0 ? <div className="empty-state"><CircleAlert size={24} className="gold" /><h3>No exact matches</h3><p>Try searching “anywhere” for a broader look at the current fleet.</p><button className="btn btn-outline btn-sm" onClick={() => setResults(null)} data-testid="button-clear-search">View featured fleet</button></div> : <div className="fleet-grid">{(results || vehicles.slice(0, 8)).map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>}
        </div>
      </section>
      <section className="section-tight surface-alt"><div className="container"><div className="eyebrow">Why Drive Flex</div><div className="benefits">
        {[{ icon: ShieldCheck, title: 'Verified by design', body: 'Every vehicle is reviewed for quality, clarity, and the details that matter before it joins the fleet.' }, { icon: Sparkles, title: 'Pricing with no fog', body: 'See the daily rate and your estimated total up front. No surprise math at the final step.' }, { icon: Clock3, title: 'Made for real life', body: 'Flexible pickup windows and thoughtfully placed cars make the booking feel lighter.' }, { icon: MessageSquare, title: 'Human when needed', body: 'Our future concierge layer is built around calm, useful support — not ticket queues.' }].map(({ icon: Icon, title, body }) => <div className="benefit" key={title}><Icon className="benefit-icon" size={22} /><h3>{title}</h3><p>{body}</p></div>)}
      </div></div></section>
       <section className="section process-section"><div className="container"><div className="section-heading"><div><div className="eyebrow">A clearer route</div><h2>From first search to first turn.</h2></div><p>Every part of the marketplace is designed to keep the important context close at hand.</p></div><div className="process-grid">{[{ icon: Compass, number: '01', title: 'Browse Cars', text: 'Start with a city, a date window, or simply a feeling.' }, { icon: CarFront, number: '02', title: 'Choose Your Car', text: 'Compare the details, the price, and the person behind the keys.' }, { icon: CalendarDays, number: '03', title: 'Select Rental Dates', text: 'See live demo availability before you commit to the route.' }, { icon: ArrowRight, number: '04', title: 'Book & Drive', text: 'Confirm your preview, then meet the car with confidence.' }].map(({ icon: Icon, number, title, text }) => <div className="process-step" key={number}><span>{number}</span><Icon size={22} /><h3>{title}</h3><p>{text}</p></div>)}</div></div></section>
       <section className="section surface-alt"><div className="container"><div className="section-heading"><div><div className="eyebrow">People behind the keys</div><h2>Trusted owners, close to your route.</h2></div><Link className="btn btn-outline btn-sm" href="/owners/ali-motors-lahore" data-testid="link-view-owners">Meet the owners <ArrowRight size={14} /></Link></div><div className="owner-grid">{owners.map((owner) => <Link className="owner-card" href={`/owners/${owner.slug}`} key={owner.id} data-testid={`card-owner-${owner.id}`}><div className="owner-cover" style={{ backgroundImage: `linear-gradient(0deg, rgba(10,10,10,.88), transparent), url(${owner.coverImage})` }}><img src={owner.profileImage} alt={`${owner.businessName} owner`} /><span className="verified-badge"><BadgeCheck size={13} /> Verified</span></div><div className="owner-card-body"><div className="owner-card-heading"><div><h3>{owner.businessName}</h3><p>{owner.fullName} · {owner.city}</p></div><span className="owner-count">{owner.vehicleIds.length}<small>cars</small></span></div><p>{owner.description}</p><div className="owner-card-footer"><span><MapPin size={13} /> {owner.location}</span><span>{owner.yearsExperience} years experience</span></div></div></Link>)}</div></div></section>
       <section className="section why-section"><div className="container why-layout"><div className="why-lead"><div className="eyebrow">Why rent with us</div><h2>Good judgment, built into the booking.</h2><p>Whether you need a polished arrival in Lahore or a weekend outside Islamabad, Drive Flex keeps trust visible at every step.</p><Link className="btn btn-gold" href="#fleet-results" data-testid="link-why-browse">Find your car <ArrowRight size={15} /></Link></div><div className="why-list">{[{ icon: UserCheck, title: 'Verified owners and vehicles', body: 'Identity, business context, and vehicle details are reviewed before they appear.' }, { icon: CalendarDays, title: 'Transparent rental periods', body: 'Pick-up and return dates are clear, with overlap checks before booking.' }, { icon: Zap, title: 'Easy booking', body: 'A focused flow keeps the estimate, availability, and next step in one place.' }, { icon: ShieldCheck, title: 'A secure experience', body: 'Your demo profile is kept local in this prototype, and sensitive IDs never appear publicly.' }].map(({ icon: Icon, title, body }) => <div className="why-item" key={title}><Icon size={19} /><div><h3>{title}</h3><p>{body}</p></div></div>)}</div></div></section>
      <section className="showcase"><div className="container"><div className="showcase-copy"><div className="eyebrow">The premium edit</div><h2>Some drives deserve more than a point A.</h2><p>Make an entrance, take the long way, or give a regular Tuesday a better soundtrack. Our premium collection is small on purpose.</p><Link className="btn btn-gold" href="/cars/mercedes-amg-gt" data-testid="link-premium-showcase">See the AMG GT <ArrowRight size={15} /></Link></div></div></section>
       <section className="red-band"><div className="container owner-cta"><div><div className="eyebrow">For discerning owners</div><h2>Have a car worth sharing?</h2><p>Introduce it to people who care how they move. Create your verified owner profile, then publish cars on your terms.</p></div><Link className="btn btn-gold" href="/owner/onboard" data-testid="link-list-your-car">Create owner profile <ArrowRight size={15} /></Link></div></section>
    </main>
  </Layout>;
}

function About() {
  usePageMeta('About Drive Flex', 'Learn why Drive Flex is building a more confident premium car rental marketplace.');
  return <Layout><main>
    <section className="page-hero"><div className="container"><div className="eyebrow">A considered way to move</div><h1>Good cars.<br /><span className="gold">Good judgment.</span></h1><p>Drive Flex is a premium car-rental marketplace for people who notice the difference — and want booking to feel as good as the drive.</p></div></section>
    <section className="section"><div className="container story-grid"><div><div className="eyebrow">Our point of view</div><h2>Mobility should feel like a choice, not a compromise.</h2><div className="gold-line" /><p className="muted">We started Drive Flex after too many rental experiences that made the car feel like an afterthought. The hidden fees, the tired vehicles, the handoff that took longer than the trip itself.</p><p className="muted">Our answer is a focused marketplace: quality vehicles, honest context, and a visual standard that helps you choose with confidence. This prototype is the first expression of that idea.</p></div><div className="story-image" role="img" aria-label="A premium car waiting on an open road" /></div></section>
    <section className="section surface-alt"><div className="container"><div className="section-heading"><div><div className="eyebrow">The Drive Flex promise</div><h2>Trust is built in the details.</h2></div><p>We are designing every touchpoint around the feeling of being looked after.</p></div><div className="principles">{[{n:'01', title:'A higher bar', text:'Vehicles are presented with useful specifics, not vague promises. Know what you are choosing.'}, {n:'02', title:'Less friction', text:'Clear rates, simple dates, and a focused fleet keep the decision moving in the right direction.'}, {n:'03', title:'Human confidence', text:'Behind the future marketplace is a service mindset: responsive, warm, and accountable.'}].map((item) => <div className="principle" key={item.n}><div className="principle-number">{item.n}</div><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></div></section>
    <section className="section"><div className="container owner-cta"><div><div className="eyebrow">Ready when you are</div><h2>Choose a better kind of rental.</h2><p>Browse the current collection or tell us what you want Drive Flex to make easier.</p></div><div className="hero-actions"><Link className="btn btn-gold" href="/" data-testid="link-about-browse">Browse cars</Link><Link className="btn btn-outline" href="/contact" data-testid="link-about-contact">Contact us</Link></div></div></section>
  </main></Layout>;
}

function Contact() {
  usePageMeta('Contact Drive Flex', 'Contact the Drive Flex team or start a conversation about listing your car.');
  const [form, setForm] = useState({ name: '', email: '', category: 'General question', message: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter your name and a valid email address.');
    if (form.message.trim().length < 12) return setError('Tell us a little more so we can route your note well.');
    setError(''); setStatus('loading'); window.setTimeout(() => setStatus('success'), 700);
  };
  return <Layout><main>
    <section className="page-hero"><div className="container"><div className="eyebrow">The door is open</div><h1>Let’s talk<br /><span className="gold">about the drive.</span></h1><p>Questions, feedback, or a car with a story? Send a note to the Drive Flex team.</p></div></section>
    <section className="section"><div className="container form-layout"><div><div className="eyebrow">Contact concierge</div><h2>We’re building this with care.</h2><p className="muted">This is a frontend demo, so no email is sent — but the interaction is designed to feel like the real thing.</p><div className="contact-list"><div className="contact-item"><MapPin size={18} /><div><strong>Studio</strong><span>1450 Brickell Avenue<br />Miami, FL 33131</span></div></div><div className="contact-item"><Phone size={18} /><div><strong>Concierge line</strong><span>+1 (305) 555-0148<br />Mon–Fri, 8:00 AM–6:00 PM EST</span></div></div><div className="contact-item"><Clock3 size={18} /><div><strong>Typical response</strong><span>Within one business day</span></div></div></div></div>
      <form className="form-card" onSubmit={submit} noValidate><div className="eyebrow">Send a note</div><h2 style={{ margin: '10px 0 28px', fontSize: '2rem' }}>What’s on your mind?</h2>{status === 'success' ? <div className="success-box" role="status" data-testid="status-contact-success"><Check size={17} style={{ verticalAlign: 'middle', marginRight: 7 }} />Your message has been submitted in this frontend demo. Nothing was sent, but your flow is complete.</div> : <><div className="form-grid"><div className="form-field"><label htmlFor="contact-name">Name</label><input id="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" data-testid="input-contact-name" /></div><div className="form-field"><label htmlFor="contact-email">Email</label><input id="contact-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" data-testid="input-contact-email" /></div></div><div className="form-field"><label htmlFor="contact-category">Inquiry type</label><select id="contact-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="select-contact-category"><option>General question</option><option>List my car</option><option>Vehicle feedback</option><option>Partnership</option></select></div><div className="form-field"><label htmlFor="contact-message">Message</label><textarea id="contact-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us where we can help." data-testid="textarea-contact-message" /></div>{error && <div className="error-box" role="alert" data-testid="error-contact">{error}</div>}<div className="form-actions"><button className="btn btn-primary" type="submit" disabled={status === 'loading'} data-testid="button-send-message">{status === 'loading' ? 'Submitting…' : 'Send message'} <ArrowRight size={15} /></button><span className="muted" style={{ fontSize: '.68rem' }}>Frontend demo only</span></div></>}</form>
    </div></section>
  </main></Layout>;
}

function AuthPage({ mode }: { mode: 'signin' | 'register' }) {
  const isRegister = mode === 'register';
  usePageMeta(isRegister ? 'Create your Drive Flex profile' : 'Sign in to Drive Flex', isRegister ? 'Create a frontend demo profile to save cars and preview bookings.' : 'Sign in to your Drive Flex frontend demo profile.');
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isRegister && !form.name.trim()) return setError('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (isRegister && form.password !== form.confirm) return setError('Passwords do not match.');
    setError(''); setLoading(true);
    window.setTimeout(() => { setSession({ name: isRegister ? form.name : (form.email.split('@')[0] || 'Drive Flex member'), email: form.email }); router.push('/profile'); }, 650);
  };
  return <Layout><main className="auth-wrap"><form className="auth-card" onSubmit={submit} noValidate><div className="eyebrow">{isRegister ? 'Join the movement' : 'Welcome back'}</div><h1>{isRegister ? 'Make the next drive yours.' : 'Pick up where you left off.'}</h1><p>{isRegister ? 'Save favorites, remember your preferences, and preview a more personal rental experience.' : 'Sign in to see your saved cars and demo booking history.'}</p><div className="demo-note"><CircleAlert size={16} /> This is a frontend-only demo. No account or password is stored on a server.</div>{isRegister && <div className="form-field"><label htmlFor="auth-name">Full name</label><input id="auth-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" data-testid="input-auth-name" /></div>}<div className="form-field"><label htmlFor="auth-email">Email</label><input id="auth-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" data-testid="input-auth-email" /></div><div className="form-field"><label htmlFor="auth-password">Password</label><input id="auth-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="8 characters minimum" data-testid="input-auth-password" /></div>{isRegister && <div className="form-field"><label htmlFor="auth-confirm">Confirm password</label><input id="auth-confirm" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat your password" data-testid="input-auth-confirm" /></div>}{error && <div className="error-box" role="alert" data-testid="error-auth">{error}</div>}<button className="btn btn-primary" style={{ width: '100%', marginTop: 6 }} type="submit" disabled={loading} data-testid={`button-${mode}`}>{loading ? 'Opening your demo profile…' : isRegister ? 'Create demo profile' : 'Sign in to demo'} <ArrowRight size={15} /></button><div className="auth-switch">{isRegister ? <>Already have a demo profile? <Link href="/sign-in" data-testid="link-auth-signin">Sign in</Link></> : <>New to Drive Flex? <Link href="/register" data-testid="link-auth-register">Create a demo profile</Link></>}</div></form></main></Layout>;
}

function Profile() {
  usePageMeta('Your Drive Flex profile', 'Manage your Drive Flex frontend demo profile, favorites, and booking previews.');
  const session = useSession();
  const { favorites, toggle } = useFavorites();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session?.name || '');
  const saved = allCars().filter((vehicle) => favorites.includes(vehicle.id));
  useEffect(() => { if (session?.name) setName(session.name); }, [session?.name]);
  if (!session) return <Layout><main className="auth-wrap"><div className="auth-card" style={{ textAlign: 'center' }}><div className="eyebrow">Your garage, waiting</div><h1>Sign in to see your profile.</h1><p>Save favorite cars and preview your booking history in this frontend demo.</p><div className="hero-actions" style={{ justifyContent: 'center' }}><Link className="btn btn-primary" href="/sign-in" data-testid="link-profile-signin">Sign in</Link><Link className="btn btn-outline" href="/register" data-testid="link-profile-register">Register</Link></div></div></main></Layout>;
  const saveProfile = () => { setSession({ ...session, name: name.trim() || session.name }); setEditing(false); };
  return <Layout><main><div className="container profile-head"><div className="profile-identity"><div className="avatar" aria-hidden="true">{session.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><div><div className="eyebrow">Demo profile</div><h1>{session.name}</h1><div className="muted" style={{ fontSize: '.78rem' }}>{session.email}</div></div></div><button className="btn btn-outline btn-sm" onClick={() => setSession(null)} data-testid="button-sign-out">Sign out</button></div><div className="container profile-grid"><section className="profile-panel"><h2>Profile details</h2>{editing ? <><div className="form-field"><label htmlFor="profile-name">Display name</label><input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-profile-name" /></div><div className="form-actions"><button className="btn btn-gold btn-sm" onClick={saveProfile} data-testid="button-save-profile">Save changes</button><button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} data-testid="button-cancel-profile">Cancel</button></div></> : <><div className="contact-item" style={{ marginBottom: 22 }}><UserRound size={17} /><div><strong>{session.name}</strong><span>Preferred driver</span></div></div><div className="contact-item"><Navigation size={17} /><div><strong>Favorite pickup region</strong><span>Not set yet</span></div></div><button className="btn btn-outline btn-sm" style={{ marginTop: 25 }} onClick={() => setEditing(true)} data-testid="button-edit-profile">Edit profile</button></>}</section><section className="profile-panel"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}><h2>Saved vehicles</h2><span className="muted" style={{ fontSize: '.72rem' }}>{saved.length} saved</span></div>{saved.length ? saved.map((vehicle) => <div className="history-row" key={vehicle.id}><img src={vehicle.image} alt="" /><div><strong>{vehicle.brand} {vehicle.model}</strong><span>{vehicle.location} · {formatMoney(vehicle.pricePerDay)}/day</span></div><button className="icon-btn" onClick={() => toggle(vehicle.id)} aria-label={`Remove ${vehicle.brand} ${vehicle.model}`} data-testid={`button-remove-favorite-${vehicle.id}`}><Heart size={15} fill="currentColor" /></button></div>) : <div className="empty-state"><Heart size={20} className="gold" /><p>Save a car while browsing and it will appear here.</p><Link className="btn btn-outline btn-sm" href="/" data-testid="link-profile-browse">Browse fleet</Link></div>}<h2 style={{ marginTop: 42 }}>Demo booking history</h2><div className="history-row"><div style={{ display: 'grid', placeItems: 'center', width: 70, height: 46, background: '#242424', color: 'var(--gold-light)', fontSize: '.65rem' }}>PREVIEW</div><div><strong>No confirmed bookings yet</strong><span>Your frontend demo confirmations will be noted here in a future version.</span></div><span className="muted" style={{ fontSize: '.68rem' }}>—</span></div></section></div></main></Layout>;
}

function BookingWidget({ vehicle }: { vehicle: Vehicle }) {
  const session = useSession();
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const quote = calculateRentalPrice(vehicle.pricePerDay, pickup, returnDate);
  const validate = () => {
    if (!pickup || !returnDate) return 'Select both dates to see your estimate.';
    if (pickup < todayString()) return 'Pickup date must be today or later.';
    if (returnDate <= pickup) return 'Return date must be after pickup date.';
    if (datesOverlap(vehicle, pickup, returnDate)) return 'This vehicle is unavailable for part of those dates.';
    return '';
  };
  const book = () => { const message = validate(); if (message) return setError(message); setError(''); if (!session) setShowPrompt(true); else { const bookings = getDemoBookings(); bookings.push({ vehicleId: vehicle.id, customer: session.name, pickup, returnDate, status: 'Confirmed' }); localStorage.setItem(demoBookingsKey, JSON.stringify(bookings)); setConfirmed(true); } };
  const selectedStatus = pickup && returnDate ? (datesOverlap(vehicle, pickup, returnDate) ? 'Unavailable for selected dates' : 'Available') : 'Choose dates to check availability';
  return <aside className="booking-card"><div className="eyebrow">Reserve your drive</div><h2>Ready when you are.</h2><div className="booking-price"><strong>{formatMoney(vehicle.pricePerDay)}</strong><span>per day · no payment in demo</span></div><div className="form-field"><label htmlFor="booking-pickup">Pickup date</label><input id="booking-pickup" type="date" min={todayString()} value={pickup} onChange={(e) => { setPickup(e.target.value); setConfirmed(false); setShowPrompt(false); }} data-testid="input-booking-pickup" /></div><div className="form-field"><label htmlFor="booking-return">Return date</label><input id="booking-return" type="date" min={pickup || todayString()} value={returnDate} onChange={(e) => { setReturnDate(e.target.value); setConfirmed(false); setShowPrompt(false); }} data-testid="input-booking-return" /></div><div className={`booking-availability ${selectedStatus === 'Available' ? 'is-available' : 'is-unavailable'}`}><CalendarDays size={15} /><span>{selectedStatus}</span></div>{error && <div className="error-box" role="alert" data-testid="error-booking">{error}</div>}{quote.days > 0 && !error && <div className="booking-summary"><div className="summary-row"><span>Rental duration</span><strong>{quote.days} {quote.days === 1 ? 'day' : 'days'}</strong></div><div className="summary-row"><span>{formatMoney(vehicle.pricePerDay)} × {quote.days}</span><strong>{formatMoney(quote.total)}</strong></div><div className="summary-row total"><span>Estimated total</span><strong>{formatMoney(quote.total)}</strong></div></div>}{vehicle.rentalPeriods.length > 0 && <div className="unavailable">Confirmed rentals are blocked automatically when dates overlap.</div>}{confirmed ? <div className="booking-confirm" role="status" data-testid="status-booking-confirmed"><Check size={17} style={{ verticalAlign: 'middle', marginRight: 7 }} /><strong>Demo booking confirmed.</strong><br />This frontend preview does not create a real reservation or process a payment.</div> : <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={book} disabled={selectedStatus === 'Unavailable for selected dates'} data-testid="button-book-now">Book this car <ArrowRight size={15} /></button>}{showPrompt && <div className="auth-prompt" data-testid="prompt-booking-auth">You’re almost there. Sign in or create a demo profile to continue this booking preview.<div className="auth-prompt-actions"><button className="btn btn-gold btn-sm" onClick={() => router.push('/sign-in')} data-testid="button-booking-signin">Sign in</button><button className="btn btn-outline btn-sm" onClick={() => router.push('/register')} data-testid="button-booking-register">Register</button></div></div>}</aside>;
}

function CarDetail() {
  const slug = useRouteSlug('/cars');
  const vehicle = findVehicle(slug) || getPublishedVehicles().find((item) => item.slug === slug);
  usePageMeta(vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle not found', vehicle?.description || 'Explore the Drive Flex vehicle collection.');
  const [activeImage, setActiveImage] = useState(0);
  if (!vehicle) return <Layout><main className="not-found"><div><div className="eyebrow">No vehicle here</div><h1>That drive took a detour.</h1><p className="muted">The vehicle may have moved, but there are more good choices waiting.</p><Link className="btn btn-primary" href="/" data-testid="link-detail-not-found">Browse fleet</Link></div></main></Layout>;
  const related = allCars().filter((item) => item.id !== vehicle.id && item.category === vehicle.category).slice(0, 3);
  return <Layout><main><section className="detail-hero"><div className="container"><Link className="back-link" href="/" data-testid="link-detail-back"><ChevronLeft size={15} /> Back to fleet</Link><div className="detail-grid"><div><div className="gallery-main"><img src={vehicle.gallery[activeImage]} alt={`${vehicle.brand} ${vehicle.model}, exterior view`} /></div><div className="gallery-thumbs">{vehicle.gallery.map((image, index) => <button className={`gallery-thumb ${activeImage === index ? 'active' : ''}`} key={image + index} onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`} data-testid={`button-gallery-${index}`}><img src={image} alt="" /></button>)}</div></div><div className="detail-copy"><div className="eyebrow">{vehicle.category} · {vehicle.location}</div><h1>{vehicle.brand}<br /><span className="gold">{vehicle.model}</span></h1><div className="detail-rating"><Star size={15} fill="currentColor" /> {vehicle.rating} <span>from {vehicle.reviewCount} verified demo reviews</span></div><OwnerIdentity ownerId={vehicle.ownerId} /><p>{vehicle.description}</p><div className="spec-grid"><div className="spec"><label>Seats</label><strong><Users size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{vehicle.seats}</strong></div><div className="spec"><label>Transmission</label><strong>{vehicle.transmission}</strong></div><div className="spec"><label>Powertrain</label><strong>{vehicle.fuelType}</strong></div><div className="spec"><label>Range</label><strong>{vehicle.range || 'Performance tuned'}</strong></div><div className="spec"><label>Pickup</label><strong><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{vehicle.location}</strong></div><div className="spec"><label>Host</label><strong>Verified</strong></div></div><BookingWidget vehicle={vehicle} /></div></div></div></section><section className="section-tight surface-alt"><div className="container detail-lower"><div><div className="eyebrow">The details</div><h2>Confidence, down to the last stitch.</h2><p className="muted">This vehicle is presented with clear context so you can decide without a dozen open tabs. Availability is checked against our demo calendar when you choose your dates.</p><div className="contact-item" style={{ marginTop: 22 }}><ShieldCheck size={18} /><div><strong>Drive Flex verified host</strong><span>Vehicle information and host profile reviewed for this frontend prototype.</span></div></div></div><div><div className="eyebrow">Driver notes</div><div className="review"><div className="review-top"><span>★★★★★</span><span>Jordan R.</span></div><p>“Exactly the kind of car you want waiting outside. The details were clear and the handoff felt considered.”</p></div><div className="review"><div className="review-top"><span>★★★★★</span><span>Priya S.</span></div><p>“The photos match the feeling of the car. Calm, quick, and genuinely premium.”</p></div></div></div></section>{related.length > 0 && <section className="section"><div className="container"><div className="section-heading"><div><div className="eyebrow">Keep looking</div><h2>More in this mood.</h2></div></div><div className="fleet-grid">{related.map((item) => <VehicleCard key={item.id} vehicle={item} />)}</div></div></section>}</main></Layout>;
}

function OwnerProfile() {
  const slug = useRouteSlug('/owners');
  const owner = findOwner(slug) || (getDemoOwner()?.slug === slug ? getDemoOwner() : null);
  usePageMeta(owner ? owner.businessName : 'Owner profile', 'Meet the verified owner and browse their Drive Flex cars.');
  if (!owner) return <Layout><main className="not-found"><div><div className="eyebrow">Owner profile unavailable</div><h1>That profile took a detour.</h1><Link className="btn btn-primary" href="/" data-testid="link-owner-not-found">Browse fleet</Link></div></main></Layout>;
  const cars = ownerCars(owner.id);
  return <Layout><main><section className="owner-profile-hero"><div className="owner-cover-large" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,10,10,.92), rgba(10,10,10,.32)), url(${owner.coverImage})` }} /><div className="container owner-profile-header"><img className="owner-profile-avatar" src={owner.profileImage} alt={`${owner.businessName} profile`} /><div className="owner-profile-copy"><div className="eyebrow">Verified marketplace owner</div><h1>{owner.businessName}</h1><p className="owner-name">{owner.fullName} · {owner.ownerType} <span className="verified-badge"><BadgeCheck size={13} /> Verified Car Owner</span></p><div className="owner-profile-meta"><span><MapPin size={14} /> {owner.location}</span><span>{owner.yearsExperience} years experience</span><span>{cars.length} vehicles</span></div></div></div></section><section className="section"><div className="container owner-profile-grid"><div><div className="eyebrow">The person behind the fleet</div><h2>A better handover starts with context.</h2><p className="muted">{owner.description}</p><div className="owner-facts"><div><strong>{owner.yearsExperience}</strong><span>years in the trade</span></div><div><strong>{cars.length}</strong><span>cars available</span></div><div><strong>100%</strong><span>identity verified</span></div></div></div><div className="profile-panel owner-contact-panel"><div className="eyebrow">Business details</div><h3>{owner.businessName}</h3><p className="muted">For this frontend demo, contact details stay visible to help you understand the relationship before booking.</p><div className="contact-item"><Phone size={17} /><div><strong>{owner.phone}</strong><span>{owner.email}</span></div></div><div className="contact-item"><MapPin size={17} /><div><strong>Business location</strong><span>{owner.location}</span></div></div></div></div><div className="container owner-cars-section"><div className="section-heading"><div><div className="eyebrow">Cars available from this owner</div><h2>Choose your next drive.</h2></div><span className="muted">{cars.length} carefully presented vehicles</span></div><div className="fleet-grid">{cars.map((car) => <VehicleCard vehicle={car} key={car.id} />)}</div></div></section></main></Layout>;
}

function Onboarding() {
  usePageMeta('Become a verified car owner', 'Create a professional Drive Flex owner profile in this frontend demo.');
  const router = useRouter();
  const existing = getDemoOwner();
  const [step, setStep] = useState(existing ? 2 : 1);
  const [submitted, setSubmitted] = useState(Boolean(existing));
  const [form, setForm] = useState({ fullName: existing?.fullName || '', cnic: '', phone: existing?.phone || '', email: existing?.email || '', city: existing?.city || 'Lahore', businessName: existing?.businessName || '', ownerType: (existing?.ownerType || 'Individual') as OwnerType, yearsExperience: String(existing?.yearsExperience || 3), description: existing?.description || '', businessLocation: existing?.location || '', profileImage: existing?.profileImage || '', logoImage: '', coverImage: existing?.coverImage || '' });
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const readFile = (key: 'profileImage' | 'logoImage' | 'coverImage') => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update(key, String(reader.result));
    reader.readAsDataURL(file);
  };
  const next = () => {
    if (!form.fullName || !form.cnic || !form.phone || !form.email || !form.businessName || !form.description) return;
    setStep(2);
  };
  const submit = () => {
    const owner: DemoOwnerProfile = { id: 'demo-owner', slug: 'my-drive-flex-profile', fullName: form.fullName, businessName: form.businessName, ownerType: form.ownerType, city: form.city, location: form.businessLocation || form.city, phone: form.phone, email: form.email, yearsExperience: Number(form.yearsExperience) || 0, description: form.description, profileImage: form.profileImage || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300', logoImage: form.logoImage, coverImage: form.coverImage || 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=1600', verified: true, identityVerified: true, vehicleIds: [], cnic: form.cnic, businessLocation: form.businessLocation || form.city };
    localStorage.setItem(ownerProfileKey, JSON.stringify(owner));
    setSubmitted(true);
    setStep(3);
  };
  return <Layout><main><section className="page-hero"><div className="container"><div className="eyebrow">For owners with standards</div><h1>Put your car<br /><span className="gold">in good company.</span></h1><p>Build a professional owner profile first. Your identity is checked locally for this demo and your CNIC is never shown publicly.</p></div></section><section className="section"><div className="container onboard-layout"><div className="onboard-intro"><div className="step-rail"><span className={step >= 1 ? 'active' : ''}>01 <small>Profile</small></span><span className={step >= 2 ? 'active' : ''}>02 <small>Preview</small></span><span className={step >= 3 ? 'active' : ''}>03 <small>Verified</small></span></div><div className="eyebrow">Owner onboarding</div><h2>A profile people can trust.</h2><p className="muted">Your owner identity becomes reusable across every car you publish. This is a local demo: no real identity check, email, or backend storage occurs.</p><div className="demo-note"><ShieldCheck size={16} /> CNIC is used only to simulate local verification. Public profiles show Identity Verified, never the number.</div></div><form className="form-card" onSubmit={(event) => { event.preventDefault(); if (step === 1) next(); }}>{submitted ? <div className="verification-success"><CheckCircle2 size={34} /><div><div className="eyebrow">Verification complete</div><h2>Verified Car Owner</h2><p>Your owner area is ready. Add your first car or review your profile.</p></div><div className="hero-actions"><Link className="btn btn-gold" href="/owner/dashboard" data-testid="link-owner-dashboard">Open owner dashboard <LayoutDashboard size={15} /></Link><button type="button" className="btn btn-outline" onClick={() => { setSubmitted(false); setStep(1); }} data-testid="button-edit-owner-profile"><Pencil size={14} /> Edit profile</button></div></div> : step === 1 ? <><div className="eyebrow">Step 01 · Create profile</div><h2 className="form-title">Tell us who is behind the keys.</h2><div className="form-grid"><div className="form-field"><label htmlFor="owner-full-name">Full name</label><input id="owner-full-name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Your full name" data-testid="input-owner-full-name" /></div><div className="form-field"><label htmlFor="owner-cnic">CNIC / National ID</label><input id="owner-cnic" type="password" autoComplete="off" value={form.cnic} onChange={(e) => update('cnic', e.target.value)} placeholder="Used for demo verification only" data-testid="input-owner-cnic" /></div></div><div className="form-grid"><div className="form-field"><label htmlFor="owner-phone">Phone number</label><input id="owner-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+92 300 000 0000" data-testid="input-owner-phone" /></div><div className="form-field"><label htmlFor="owner-email">Email address</label><input id="owner-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@business.com" data-testid="input-owner-email" /></div></div><div className="form-grid"><div className="form-field"><label htmlFor="owner-city">City</label><select id="owner-city" value={form.city} onChange={(e) => update('city', e.target.value)} data-testid="select-owner-city">{['Lahore', 'Islamabad', 'Karachi', 'Rawalpindi', 'Faisalabad', 'Multan'].map((city) => <option key={city}>{city}</option>)}</select></div><div className="form-field"><label htmlFor="owner-business">Business / shop name</label><input id="owner-business" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="The name customers will remember" data-testid="input-owner-business" /></div></div><div className="form-grid"><div className="form-field"><label htmlFor="owner-type">Owner type</label><select id="owner-type" value={form.ownerType} onChange={(e) => update('ownerType', e.target.value)} data-testid="select-owner-type">{['Individual', 'Car Rental Business', 'Dealership', 'Fleet Owner'].map((type) => <option key={type}>{type}</option>)}</select></div><div className="form-field"><label htmlFor="owner-years">Years of experience</label><input id="owner-years" type="number" min="0" value={form.yearsExperience} onChange={(e) => update('yearsExperience', e.target.value)} data-testid="input-owner-years" /></div></div><div className="form-field"><label htmlFor="owner-description">Short professional description</label><textarea id="owner-description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="What makes your cars and handovers considered?" data-testid="textarea-owner-description" /></div><div className="form-field"><label htmlFor="owner-location">Business location</label><input id="owner-location" value={form.businessLocation} onChange={(e) => update('businessLocation', e.target.value)} placeholder="Area, street, or pickup detail" data-testid="input-owner-location" /></div><div className="upload-grid"><label className="upload-field"><ImagePlus size={18} /><span>Profile image<input type="file" accept="image/*" onChange={readFile('profileImage')} data-testid="input-owner-profile-image" /></span></label><label className="upload-field"><ImagePlus size={18} /><span>Business logo<input type="file" accept="image/*" onChange={readFile('logoImage')} data-testid="input-owner-logo" /></span></label><label className="upload-field"><ImagePlus size={18} /><span>Cover image<input type="file" accept="image/*" onChange={readFile('coverImage')} data-testid="input-owner-cover" /></span></label></div><button className="btn btn-primary" type="submit" data-testid="button-owner-next">Review profile <ArrowRight size={15} /></button></> : <><div className="eyebrow">Step 02 · Profile preview</div><h2 className="form-title">Make sure it feels like you.</h2><div className="profile-preview"><div className="preview-cover" style={{ backgroundImage: `url(${form.coverImage || 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=1200'})` }} /><img src={form.profileImage || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300'} alt="Profile preview" /><h3>{form.businessName}</h3><p>{form.fullName} · {form.city}</p><span className="verified-badge"><BadgeCheck size={13} /> Identity ready for verification</span><div className="preview-description">{form.description}</div></div><div className="form-actions"><button type="button" className="btn btn-ghost" onClick={() => setStep(1)} data-testid="button-owner-back">Back to edit</button><button type="button" className="btn btn-gold" onClick={submit} data-testid="button-submit-verification">Submit for Verification <Check size={15} /></button></div></>}</form></div></section></main></Layout>;
}

function OwnerDashboard() {
  const owner = getDemoOwner();
  const [, setLocation] = useLocation();
  usePageMeta('Owner dashboard', 'Manage your Drive Flex cars and demo rentals.');
  if (!owner) return <Layout><main className="auth-wrap"><div className="auth-card"><div className="eyebrow">Owner access</div><h1>Start with your profile.</h1><p>Verified owners can publish cars, see rental previews, and refine their public profile.</p><Link className="btn btn-gold" href="/owner/onboard" data-testid="link-dashboard-onboard">Create owner profile <ArrowRight size={15} /></Link></div></main></Layout>;
  const cars = ownerCars(owner.id);
  const bookings = getDemoBookings().filter((booking) => cars.some((car) => car.id === booking.vehicleId));
  return <Layout><main><section className="dashboard-hero"><div className="container dashboard-header"><div><div className="eyebrow">Owner studio · frontend demo</div><h1>Good to have you, <span className="gold">{owner.fullName.split(' ')[0]}.</span></h1><p>Manage the cars, dates, and details behind your Drive Flex profile.</p></div><Link className="btn btn-gold" href="/owner/cars/new" data-testid="link-add-new-car"><Plus size={15} /> Add new car</Link></div></section><section className="section-tight"><div className="container"><div className="dashboard-stats"><div><span>Total cars</span><strong>{cars.length}</strong><small>Published in your fleet</small></div><div><span>Available cars</span><strong>{cars.filter((car) => availabilityLabel(car) === 'Available').length}</strong><small>Ready for a new route</small></div><div><span>Currently rented</span><strong>{cars.filter((car) => availabilityLabel(car) === 'Currently rented').length}</strong><small>Active rental periods</small></div><div><span>Upcoming rentals</span><strong>{bookings.length}</strong><small>Demo booking previews</small></div></div></div></section><section className="section surface-alt"><div className="container dashboard-grid"><div className="dashboard-main"><div className="dashboard-section-heading"><div><div className="eyebrow">My cars</div><h2>Your published fleet.</h2></div><Link className="btn btn-outline btn-sm" href="/owner/cars/new" data-testid="link-dashboard-add-car"><Plus size={13} /> Add car</Link></div>{cars.length ? <div className="dashboard-car-list">{cars.map((car) => <div className="dashboard-car-row" key={car.id}><img src={car.image} alt={`${car.brand} ${car.model}`} /><div><strong>{car.brand} {car.model}</strong><span>{car.location} · {formatMoney(car.pricePerDay)} / day</span><AvailabilityPill vehicle={car} /></div><Link className="btn btn-ghost btn-sm" href={`/cars/${car.slug}`} data-testid={`link-dashboard-car-${car.id}`}>View <ArrowRight size={13} /></Link></div>)}</div> : <div className="empty-state"><CarFront size={24} className="gold" /><h3>Your first car is waiting.</h3><p>Publish a polished listing and make it available to the marketplace.</p><Link className="btn btn-gold btn-sm" href="/owner/cars/new" data-testid="link-empty-add-car">Add new car</Link></div>}<div className="dashboard-section-heading rental-heading"><div><div className="eyebrow">Rentals</div><h2>Dates to keep in view.</h2></div></div><div className="rental-table">{bookings.length ? bookings.map((booking, index) => { const car = cars.find((item) => item.id === booking.vehicleId); return <div className="rental-row" key={`${booking.vehicleId}-${index}`}><strong>{car?.brand} {car?.model}</strong><span>{booking.customer}</span><span>{booking.pickup} → {booking.returnDate}</span><b>{booking.status}</b></div>; }) : <div className="empty-state"><CalendarDays size={22} className="gold" /><p>No demo rentals yet. Confirmations will appear here.</p></div>}</div></div><aside className="dashboard-side"><div className="profile-panel"><div className="dashboard-profile-top"><img src={owner.profileImage} alt={`${owner.businessName} profile`} /><div><div className="eyebrow">Your profile</div><h3>{owner.businessName}</h3><span className="verified-badge"><BadgeCheck size={12} /> Verified</span></div></div><p className="muted">{owner.description}</p><button className="btn btn-outline btn-sm" onClick={() => setLocation(`/owners/${owner.slug}`)} data-testid="button-view-public-owner">View public profile <ArrowRight size={13} /></button></div><div className="profile-panel"><div className="eyebrow">Demo storage</div><h3>Local by design.</h3><p className="muted">Your owner profile, published cars, and booking previews live only in this browser. No real CNIC or payment is processed.</p><Link className="btn btn-ghost btn-sm" href="/owner/onboard" data-testid="link-edit-owner-profile"><Pencil size={13} /> Edit profile</Link></div></aside></div></section></main></Layout>;
}

function AddCar() {
  const owner = getDemoOwner();
  const [, setLocation] = useLocation();
  usePageMeta('Publish a car', 'Create a professional Drive Flex vehicle listing.');
  const [image, setImage] = useState('');
  const [form, setForm] = useState({ name: '', brand: '', model: '', year: String(new Date().getFullYear()), variant: '', description: '', price: '', pricingType: 'Per Day', location: owner?.city || 'Lahore', features: '', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5', availability: 'Available' });
  if (!owner) return <Layout><main className="not-found"><div><div className="eyebrow">Owner profile required</div><h1>Let’s start with who you are.</h1><Link className="btn btn-gold" href="/owner/onboard" data-testid="link-add-car-onboard">Create owner profile</Link></div></main></Layout>;
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const readImage = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setImage(String(reader.result)); reader.readAsDataURL(file); };
  const publish = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.brand || !form.model || !form.price || !form.description) return;
    const slug = `${form.brand}-${form.model}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newVehicle: Vehicle = { id: `demo-${Date.now()}`, slug, brand: form.brand, model: form.model, category: 'Premium', location: `${form.location}, Pakistan`, pricePerDay: Number(form.price), rating: 5, reviewCount: 0, seats: Number(form.seats) || 5, transmission: form.transmission, fuelType: form.fuelType, description: form.description, image: image || 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1600', gallery: [image || 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1600'], unavailableDates: [], rentalPeriods: [], provider: owner.businessName, ownerId: owner.id, pricingType: form.pricingType as Vehicle['pricingType'], features: form.features.split(',').map((item) => item.trim()).filter(Boolean), year: Number(form.year), variant: form.variant };
    localStorage.setItem(publishedVehiclesKey, JSON.stringify([...getPublishedVehicles(), newVehicle]));
    setLocation('/owner/dashboard');
  };
  return <Layout><main><section className="page-hero"><div className="container"><div className="eyebrow">Owner studio · add listing</div><h1>Give your next car<br /><span className="gold">the right introduction.</span></h1><p>Clear details make the difference. This local demo listing can be edited by publishing a new version from your browser.</p></div></section><section className="section"><div className="container form-layout listing-layout"><form className="form-card" onSubmit={publish}><div className="eyebrow">Vehicle details</div><h2 className="form-title">Build the listing.</h2><div className="form-grid"><div className="form-field"><label htmlFor="car-name">Car name</label><input id="car-name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="The name guests will see" data-testid="input-car-name" /></div><div className="form-field"><label htmlFor="car-brand">Brand</label><input id="car-brand" value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="Toyota" data-testid="input-car-brand" /></div><div className="form-field"><label htmlFor="car-model">Model</label><input id="car-model" value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="Land Cruiser" data-testid="input-car-model" /></div><div className="form-field"><label htmlFor="car-year">Year</label><input id="car-year" type="number" value={form.year} onChange={(e) => update('year', e.target.value)} data-testid="input-car-year" /></div><div className="form-field"><label htmlFor="car-variant">Variant</label><input id="car-variant" value={form.variant} onChange={(e) => update('variant', e.target.value)} placeholder="Executive" data-testid="input-car-variant" /></div><div className="form-field"><label htmlFor="car-price">Rental price / day</label><input id="car-price" type="number" min="1" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="150" data-testid="input-car-price" /></div><div className="form-field"><label htmlFor="car-pricing">Pricing type</label><select id="car-pricing" value={form.pricingType} onChange={(e) => update('pricingType', e.target.value)} data-testid="select-car-pricing"><option>Per Day</option><option>Per Week</option><option>Per Month</option></select></div><div className="form-field"><label htmlFor="car-location">Location</label><input id="car-location" value={form.location} onChange={(e) => update('location', e.target.value)} data-testid="input-car-location" /></div></div><div className="form-field"><label htmlFor="car-description">Description</label><textarea id="car-description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the condition, feeling, and ideal use of the car." data-testid="textarea-car-description" /></div><div className="form-field"><label htmlFor="car-features">Features</label><input id="car-features" value={form.features} onChange={(e) => update('features', e.target.value)} placeholder="Leather interior, Sunroof, Airport pickup" data-testid="input-car-features" /><span className="field-hint">Separate features with commas.</span></div><div className="form-grid"><div className="form-field"><label htmlFor="car-transmission">Transmission</label><select id="car-transmission" value={form.transmission} onChange={(e) => update('transmission', e.target.value)} data-testid="select-car-transmission"><option>Automatic</option><option>Manual</option></select></div><div className="form-field"><label htmlFor="car-fuel">Fuel type</label><select id="car-fuel" value={form.fuelType} onChange={(e) => update('fuelType', e.target.value)} data-testid="select-car-fuel"><option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></div><div className="form-field"><label htmlFor="car-seats">Seats</label><input id="car-seats" type="number" min="1" max="12" value={form.seats} onChange={(e) => update('seats', e.target.value)} data-testid="input-car-seats" /></div><div className="form-field"><label htmlFor="car-availability">Availability</label><select id="car-availability" value={form.availability} onChange={(e) => update('availability', e.target.value)} data-testid="select-car-availability"><option>Available</option><option>Currently Rented</option><option>Coming soon</option></select></div></div><label className="upload-field listing-upload"><ImagePlus size={20} /><span>Add car image<input type="file" accept="image/*" onChange={readImage} data-testid="input-car-image" /></span></label><button className="btn btn-primary publish-button" type="submit" data-testid="button-publish-car">Publish car <ArrowRight size={15} /></button></form><aside className="listing-preview"><div className="eyebrow">Live preview</div><div className="vehicle-preview-card">{image ? <img src={image} alt="Car listing preview" /> : <div className="preview-placeholder"><CarFront size={28} /><span>Your car image</span></div>}<div><div className="vehicle-category">{form.pricingType}</div><h3>{form.brand || 'Your brand'} {form.model || 'Your model'}</h3><p>{form.description || 'A concise description will help guests imagine the drive.'}</p><OwnerIdentity ownerId={owner.id} compact /><div className="price">{form.price ? formatMoney(Number(form.price)) : '$—'} <small>/ day</small></div></div></div><div className="demo-note"><ShieldCheck size={15} /> Published cars remain in this browser only. You can see them in your owner dashboard.</div></aside></div></section></main></Layout>;
}

function Router() {
  const pathname = (usePathname() || '/').replace(/\/+$/, '') || '/';

  if (pathname === '/') return <Home />;
  if (pathname === '/about') return <About />;
  if (pathname === '/contact') return <Contact />;
  if (pathname === '/register') return <AuthPage mode="register" />;
  if (pathname === '/sign-in') return <AuthPage mode="signin" />;
  if (pathname === '/profile') return <Profile />;
  if (pathname === '/owner/onboard') return <Onboarding />;
  if (pathname === '/owner/dashboard') return <OwnerDashboard />;
  if (pathname === '/owner/cars/new') return <AddCar />;
  if (pathname.startsWith('/owners/')) return <OwnerProfile />;
  if (pathname.startsWith('/cars/')) return <CarDetail />;
  return <NotFound />;
}

export default function App() {
  return <Router />;
}