"use client";

import { useEffect, useRef, useState } from "react";

type Tab = "home" | "menu" | "games" | "leaderboard" | "rewards";
type KnifePin = { id: number; angle: number };
type MenuItem = { name: string; category: string; price: number; note: string; tag?: string };
type ThrowMotion = { id: number; distance: number; colliding: boolean };
type LeaderboardEntry = {
  rank: number;
  name: string;
  table: string;
  score: number;
  title: string;
  avatar: string;
  favorite: string;
  date: string;
  isUser?: boolean;
};

const KNIFE_WIDTH = 24;
const KNIFE_HEIGHT = 80;
const KNIFE_TIP_INSET = 3.5;
const KNIFE_TIP_X = 12;
const TARGET_SPREAD = 8;
const EMBED_DEPTH = 10;
const KNIFE_COLLISION_DEGREES = 14;

function KnifeIcon({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 28 96" aria-hidden="true">
      <defs>
        <linearGradient id="steel" x1="0" x2="1">
          <stop offset="0" stopColor="#9c9a93" />
          <stop offset=".32" stopColor="#fffdf2" />
          <stop offset=".55" stopColor="#d4d2c8" />
          <stop offset="1" stopColor="#777b7d" />
        </linearGradient>
        <linearGradient id="wood" x1="0" x2="1">
          <stop offset="0" stopColor="#563328" />
          <stop offset=".48" stopColor="#b27b4c" />
          <stop offset="1" stopColor="#603a2b" />
        </linearGradient>
      </defs>
      <path d="M14 4 C10 16 5 28 5 43 L5 56 Q14 62 23 56 L23 43 C23 28 18 16 14 4Z" fill="url(#steel)" stroke="#59483a" strokeWidth="1.3" />
      <path d="M14 7 L14 58" fill="none" stroke="#fffdf2" strokeOpacity=".78" strokeWidth="1.4" />
      <path d="M6 53 Q14 57 22 53 L22 62 L6 62Z" fill="#765136" stroke="#e8d5b6" strokeWidth="1.2" />
      <path d="M8 62 Q14 59 20 62 L19 87 Q14 93 9 87Z" fill="url(#wood)" stroke="#3d291f" strokeWidth="1.5" />
      <path d="M11 66 L17 65 M11 72 L17 71 M11 78 L17 77 M12 84 L16 83" stroke="#e6c293" strokeOpacity=".8" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 89 Q14 93 18 89" fill="none" stroke="#d3aa75" strokeWidth="2" />
    </svg>
  );
}

const menuItems: MenuItem[] = [
  { name: "Cappuccino", category: "Hot Coffee", price: 160, note: "Espresso with steamed milk and foam." },
  { name: "Café Latte", category: "Hot Coffee", price: 160, note: "Smooth espresso blended with steamed milk." },
  { name: "Americano", category: "Hot Coffee", price: 150, note: "Espresso topped with hot water." },
  { name: "White Chocolate Mocha", category: "Hot Coffee", price: 200, note: "Espresso with white chocolate and steamed milk." },
  { name: "Classic Cold Coffee", category: "Cold Coffee", price: 160, note: "In-house coffee blended with milk and ice." },
  { name: "Iced Tiramisu Coffee", category: "Cold Coffee", price: 220, note: "Cold coffee with a creamy tiramisu finish." },
  { name: "Classic Iced Vietnamese", category: "Cold Coffee", price: 180, note: "Strong coffee with sweetened condensed milk.", tag: "Bestseller" },
  { name: "Coconut Vietnamese", category: "Cold Coffee", price: 240, note: "A creamy coconut take on Vietnamese coffee." },
  { name: "Tiramisu Latte", category: "Specials", price: 240, note: "Coffee-inspired treat with mascarpone notes." },
  { name: "Classic Cinnamon Roll", category: "Cinnamon Rolls", price: 180, note: "Classic soft roll with warm cinnamon." },
  { name: "Strawberry Nutella", category: "Cinnamon Rolls", price: 200, note: "Soft roll with strawberry frosting and Nutella drizzle." },
  { name: "Biscoff Bliss", category: "Cinnamon Rolls", price: 220, note: "Cinnamon roll with Biscoff spread and chocolate." },
  { name: "Apple Caramel", category: "Cinnamon Rolls", price: 200, note: "Cream cheese icing, apple and toffee caramel." },
  { name: "Blueberry Tropical", category: "Cinnamon Rolls", price: 220, note: "Blueberry cream cheese icing and fruity finish." },
  { name: "Classic NY Style Cheesecake", category: "Cheesecakes", price: 180, note: "Classic New York-style cheesecake." },
  { name: "Burnt Basque Cheesecake", category: "Cheesecakes", price: 260, note: "Soft cheesecake with a burnt top." },
  { name: "Tiramisu Chocolate Cheesecake", category: "Cheesecakes", price: 240, note: "Espresso-infused cheesecake with chocolate." },
  { name: "Signature Apple Tarte Tatin", category: "Tarts", price: 240, note: "Apple, caramel and delicate pastry." },
  { name: "Belgian Chocolate & Caramel Tart", category: "Tarts", price: 230, note: "Dark Belgian chocolate with caramel." },
  { name: "Double Chocolate Chunk", category: "Cookies", price: 80, note: "Fudgy cookie with dark chocolate chunks." },
  { name: "Classic Butter Cookie", category: "Cookies", price: 60, note: "Crisp, golden butter cookie." },
  { name: "Classic Margherita Pizza", category: "Pizza", price: 270, note: "Tomato sauce, cheese, basil and mozzarella." },
  { name: "Paneer Tikka Pizza", category: "Pizza", price: 320, note: "Smoky paneer with crunchy vegetables." },
  { name: "Spinach & Mushroom Spaghetti", category: "Pasta", price: 260, note: "Spaghetti tossed with sauce and cream." },
  { name: "Bombay Grilled Cheese", category: "Sandwiches", price: 200, note: "Grilled sandwich with Bombay-style chutney." },
  { name: "Paneer Makhani Sandwich", category: "Sandwiches", price: 200, note: "Paneer in rich, buttery makhani gravy." }
];

const categories = ["All", "Hot Coffee", "Cold Coffee", "Cinnamon Rolls", "Cheesecakes", "Tarts", "Cookies", "Sandwiches", "Pizza", "Pasta", "Specials"];

const tiers = [
  { min: 0, max: 7, name: "Keep practising", discount: 0, note: "Try another round to unlock a treat.", code: "NMN-TRY" },
  { min: 8, max: 14, name: "Coffee Break", discount: 5, note: "5% off one eligible item.", code: "NMN-COFFEE5" },
  { min: 15, max: 22, name: "Roll With It", discount: 10, note: "10% off one eligible item.", code: "NMN-ROLL10" },
  { min: 23, max: 99, name: "Naan-stop Champion", discount: 15, note: "15% off one eligible item.", code: "NMN-CHAMP15" }
];

const games = [
  { name: "Target Rush", detail: "Time each throw. Hit the target and avoid the blades.", icon: "✦", live: true, label: "PLAY NOW" },
  { name: "Coffee Catch", detail: "Catch the falling coffee beans.", icon: "☕", live: false, label: "COMING SOON" },
  { name: "Cinnamon Stack", detail: "Stack the rolls as high as you can.", icon: "🥐", live: false, label: "COMING SOON" },
  { name: "Latte Art Rush", detail: "Trace the perfect latte-art pattern.", icon: "🎨", live: false, label: "COMING SOON" },
  { name: "Dessert Memory", detail: "Match the café's favourite treats.", icon: "🍰", live: false, label: "COMING SOON" },
  { name: "Pizza Dash", detail: "Build the order before the timer runs out.", icon: "🍕", live: false, label: "COMING SOON" }
];

const baseWeeklyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Aarav Sharma", table: "Table 02", score: 38, title: "Naan-stop Champion", avatar: "AS", favorite: "Classic Cinnamon Roll", date: "Today" },
  { rank: 2, name: "Priya Menon", table: "Table 07", score: 34, title: "Roll With It Master", avatar: "PM", favorite: "Iced Vietnamese", date: "Yesterday" },
  { rank: 3, name: "Rohan Kapoor", table: "Table 04", score: 29, title: "Blade Virtuoso", avatar: "RK", favorite: "Signature Tarte Tatin", date: "2d ago" },
  { rank: 4, name: "Ananya Deshmukh", table: "Table 09", score: 26, title: "Coffee Break Pro", avatar: "AD", favorite: "Tiramisu Latte", date: "3d ago" },
  { rank: 5, name: "Kabir Verma", table: "Table 01", score: 24, title: "Sharpshooter", avatar: "KV", favorite: "Biscoff Bliss Roll", date: "4d ago" },
  { rank: 6, name: "Zoya Khan", table: "Table 05", score: 21, title: "Roll Enthusiast", avatar: "ZK", favorite: "Classic Cold Coffee", date: "5d ago" },
  { rank: 7, name: "Dev Patel", table: "Table 03", score: 19, title: "Target Striker", avatar: "DP", favorite: "Paneer Tikka Pizza", date: "6d ago" },
  { rank: 8, name: "Meera Nair", table: "Table 08", score: 17, title: "Café Regular", avatar: "MN", favorite: "Americano", date: "6d ago" }
];

const baseMonthlyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Vikram Malhotra", table: "Table 04", score: 58, title: "Grand Champion", avatar: "VM", favorite: "Double Chocolate Chunk", date: "Nov 4" },
  { rank: 2, name: "Aarav Sharma", table: "Table 02", score: 52, title: "Speed Thrower", avatar: "AS", favorite: "Classic Cinnamon Roll", date: "Nov 11" },
  { rank: 3, name: "Neha Joshi", table: "Table 11", score: 47, title: "Precision Master", avatar: "NJ", favorite: "Burnt Basque Cheesecake", date: "Nov 8" },
  { rank: 4, name: "Priya Menon", table: "Table 07", score: 43, title: "Naan-stop Legend", avatar: "PM", favorite: "Iced Vietnamese", date: "Nov 10" },
  { rank: 5, name: "Siddharth Rao", table: "Table 06", score: 39, title: "Target Maestro", avatar: "SR", favorite: "Coconut Vietnamese", date: "Nov 2" },
  { rank: 6, name: "Rohan Kapoor", table: "Table 04", score: 36, title: "Roll Prodigy", avatar: "RK", favorite: "Signature Tarte Tatin", date: "Nov 9" },
  { rank: 7, name: "Isha Sundaram", table: "Table 10", score: 33, title: "Espresso Expert", avatar: "IS", favorite: "Cappuccino", date: "Nov 6" },
  { rank: 8, name: "Tanmay Sen", table: "Table 03", score: 30, title: "Café Champion", avatar: "TS", favorite: "Bombay Grilled Cheese", date: "Nov 1" }
];

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSelected, setGameSelected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [challengeMode, setChallengeMode] = useState(true);
  const [level, setLevel] = useState(1);
  const [targetRotation, setTargetRotation] = useState(0);
  const [pins, setPins] = useState<KnifePin[]>([]);
  const [throwsLeft, setThrowsLeft] = useState(5);
  const [gameMessage, setGameMessage] = useState("Tap the board to throw");
  const [throwMotion, setThrowMotion] = useState<ThrowMotion | null>(null);
  const [targetShudder, setTargetShudder] = useState(false);
  const isThrowingRef = useRef(false);
  const [bestScore, setBestScore] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [scorePreview, setScorePreview] = useState(0);
  const scoreRef = useRef(0);
  const gameStartRef = useRef(0);
  const rotationRef = useRef(0);
  const pinId = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const throwTimeoutRef = useRef<number | null>(null);

  // Leaderboard state
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<"weekly" | "monthly">("weekly");

  // Rewards & Coupon state
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [redeemedDiscount, setRedeemedDiscount] = useState<number>(0);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filtered = menuItems.filter(item =>
    (category === "All" || item.category === category) &&
    (item.name.toLowerCase().includes(search.toLowerCase()) || item.note.toLowerCase().includes(search.toLowerCase()))
  );

  const currentEffectiveScore = bestScore;
  const currentTier = tiers.find(t => currentEffectiveScore >= t.min && currentEffectiveScore <= t.max) ?? tiers[0];
  const roundTier = score === null ? null : (tiers.find(t => score >= t.min && score <= t.max) ?? tiers[0]);

  useEffect(() => {
    if (!gameStarted) return;
    let frame = 0;
    let last = performance.now();
    const animate = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      rotationRef.current = (rotationRef.current + dt * (0.035 + level * 0.006)) % 360;
      setTargetRotation(rotationRef.current);
      if (challengeMode) {
        const remaining = Math.max(0, 30 - Math.floor((Date.now() - gameStartRef.current) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          finishGame();
          return;
        }
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [gameStarted, challengeMode, level]);

  function finishGame() {
    setGameStarted(false);
    isThrowingRef.current = false;
    setThrowMotion(null);
    setScore(scoreRef.current);
    setBestScore(v => Math.max(v, scoreRef.current));
    setGameMessage("Round complete");
  }

  function startTargetGame(mode = challengeMode) {
    setChallengeMode(mode);
    scoreRef.current = 0;
    setScore(null);
    setScorePreview(0);
    setTimeLeft(30);
    setLevel(1);
    setThrowsLeft(5);
    setPins([]);
    setTargetRotation(0);
    rotationRef.current = 0;
    pinId.current = 0;
    setThrowMotion(null);
    isThrowingRef.current = false;
    setTargetShudder(false);
    if (throwTimeoutRef.current !== null) window.clearTimeout(throwTimeoutRef.current);
    gameStartRef.current = Date.now();
    setGameMessage("Tap the board to throw");
    setGameStarted(true);
  }

  function throwKnife() {
    const board = boardRef.current;
    const target = targetRef.current;
    if (!gameStarted || isThrowingRef.current || !board || !target) return;

    isThrowingRef.current = true;

    const boardRect = board.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetCenterY = targetRect.top + targetRect.height / 2 - boardRect.top;
    const targetRadius = target.offsetWidth / 2;
    const pinRadius = targetRadius + TARGET_SPREAD - EMBED_DEPTH;

    // Knife shoots straight up from resting position to hit the bottom circumference of the plate
    const impactWorldY = targetCenterY + pinRadius;
    const knifeStartTop = board.clientHeight - 18 - KNIFE_HEIGHT;
    const knifeStartTipY = knifeStartTop + KNIFE_TIP_INSET;
    const flightDistance = impactWorldY - knifeStartTipY;

    // The plate rotates clockwise by rotationRef.current degrees.
    // The impact is at the bottom (world angle 90°).
    // In plate-local coordinates: hitAngle = (90 - targetRotation + 360) % 360.
    const currentRotation = rotationRef.current % 360;
    const hitAngle = (90 - currentRotation + 360) % 360;

    const collision = pins.some(pin => {
      const diff = Math.abs((hitAngle - pin.angle + 180) % 360 - 180);
      return diff < KNIFE_COLLISION_DEGREES;
    });

    const nextThrowId = (throwMotion?.id ?? 0) + 1;
    setThrowMotion({
      id: nextThrowId,
      distance: flightDistance,
      colliding: collision
    });

    if (throwTimeoutRef.current !== null) window.clearTimeout(throwTimeoutRef.current);

    if (collision) {
      throwTimeoutRef.current = window.setTimeout(() => {
        setGameMessage("Blade collision · round over");
        setThrowMotion(null);
        isThrowingRef.current = false;
        finishGame();
      }, 520);
      return;
    }

    throwTimeoutRef.current = window.setTimeout(() => {
      setThrowMotion(null);
      isThrowingRef.current = false;

      const nextPins = [...pins, { id: ++pinId.current, angle: hitAngle }];
      setPins(nextPins);

      setTargetShudder(true);
      window.setTimeout(() => setTargetShudder(false), 120);

      scoreRef.current += 1;
      setScorePreview(scoreRef.current);

      const needed = 4 + level;
      if (nextPins.length >= needed) {
        setLevel(v => v + 1);
        setPins([]);
        setThrowsLeft(5 + level);
        setGameMessage(`Level ${level + 1} · faster spin!`);
      } else {
        setThrowsLeft(needed - nextPins.length);
        setGameMessage("Nice hit · keep going");
      }
    }, 150);
  }

  function handleClaimCoupon(code: string, discount: number) {
    setCoupon(code);
    setCouponInput(code);
    setRedeemError(null);
    setTab("rewards");
  }

  function handleApplyCoupon() {
    const cleaned = couponInput.trim().toUpperCase();
    if (!cleaned) {
      setRedeemError("Please enter a coupon code");
      return;
    }

    // Match recognized promo codes or generated NMN- codes
    let discount = 10;
    if (cleaned.includes("CHAMP") || cleaned.includes("15")) {
      discount = 15;
    } else if (cleaned.includes("ROLL") || cleaned.includes("10")) {
      discount = 10;
    } else if (cleaned.includes("COFFEE") || cleaned.includes("5") || cleaned.includes("TRY")) {
      discount = 5;
    } else if (cleaned.startsWith("NMN-")) {
      discount = currentTier.discount > 0 ? currentTier.discount : 10;
    } else {
      setRedeemError("Invalid code. Try NMN-ROLL10 or claim your coupon below!");
      return;
    }

    setRedeemedCode(cleaned);
    setRedeemedDiscount(discount);
    setRedeemError(null);
  }

  function handleCopy(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(text);
      window.setTimeout(() => setCopiedCode(null), 2000);
    }
  }

  // Build active leaderboard list with user's score integrated if played
  const rawLeaderboard = leaderboardTimeframe === "weekly" ? baseWeeklyLeaderboard : baseMonthlyLeaderboard;
  let activeLeaderboard = [...rawLeaderboard];
  if (bestScore > 0) {
    const userEntry: LeaderboardEntry = {
      rank: 1,
      name: "You (Table 04)",
      table: "Table 04",
      score: bestScore,
      title: currentTier.discount >= 15 ? "Naan-stop Champion" : currentTier.discount >= 10 ? "Roll With It" : "Target Striker",
      avatar: "YOU",
      favorite: "Active Challenger",
      date: "Just now",
      isUser: true
    };
    activeLeaderboard = [...activeLeaderboard, userEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }

  const nav: { id: Tab; label: string; icon: string }[] = [
    { id: "home", label: "Home", icon: "⌂" },
    { id: "menu", label: "Menu", icon: "☷" },
    { id: "games", label: "Games", icon: "✳" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
    { id: "rewards", label: "Rewards", icon: "✧" }
  ];

  return (
    <main className="site-shell">
      <div className="concept-strip">INDEPENDENT CONCEPT PROTOTYPE · NOT AN OFFICIAL CAFÉ SERVICE</div>
      <header className="masthead">
        <div className="logo-badge" aria-label="No Meat Naan Logo">
          <img
            className="logo"
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/no-meat-naan-logo.png`}
            alt="No Meat Naan logo"
            onError={e => {
              e.currentTarget.style.opacity = "0";
            }}
          />
          <span className="logo-fallback" aria-hidden="true">NMN</span>
        </div>
        <div className="masthead-copy">
          <span className="est">ESTD. 2021</span>
          <strong>NO MEAT NAAN</strong>
          <span>COFFEE SHOP · BAKERY · PÂTISSERIE</span>
        </div>
        <div className="table-tag">YOUR TABLE<br /><b>04</b></div>
      </header>

      {tab === "home" ? (
        <section className="home-landing">
          <div className="home-hero-copy">
            <div className="eyebrow">A LITTLE SOMETHING WHILE YOU WAIT</div>
            <h1>Good coffee.<br /><em>Great little wins.</em></h1>
            <p>Explore the fresh bakery menu, take a quick Target Rush game break, check the table leaderboard, and unlock discounts at the counter.</p>
            <div className="landing-actions">
              <button className="landing-card menu-action" onClick={() => setTab("menu")}>
                <span className="action-icon">☕</span>
                <span><b>Explore the menu</b><small>Find your next favourite sip or roll</small></span>
                <i>↗</i>
              </button>
              <button className="landing-card game-action" onClick={() => { setTab("games"); setGameSelected(false); }}>
                <span className="action-icon">🎮</span>
                <span><b>Play Target Rush</b><small>Arcade timing challenge & scores</small></span>
                <i>↗</i>
              </button>
              <button className="landing-card leaderboard-action" onClick={() => setTab("leaderboard")}>
                <span className="action-icon">🏆</span>
                <span><b>Café Leaderboard</b><small>Weekly & monthly high scorers</small></span>
                <i>↗</i>
              </button>
              <button className="landing-card reward-action" onClick={() => setTab("rewards")}>
                <span className="action-icon">🎟</span>
                <span><b>Rewards & Coupons</b><small>Enter promo code or claim discounts</small></span>
                <i>↗</i>
              </button>
            </div>
            <div className="landing-footnote">SCAN · EXPLORE · PLAY · CLIMB · ENJOY</div>
          </div>
          <div className="landing-art">
            <div className="roundel">
              <small>NO MEAT NAAN</small>
              <strong>✳</strong>
              <small>EST. 2021</small>
            </div>
            <div className="landing-caption">Made for your<br /><em>little café moments.</em></div>
          </div>
        </section>
      ) : (
        <>
          <section className="main-content">
            {tab === "menu" && (
              <div>
                <div className="section-top">
                  <div>
                    <div className="eyebrow">BAKED FRESH · BREWED WITH CARE</div>
                    <h2>The menu<span className="period">.</span></h2>
                  </div>
                  <span className="menu-note">SAMPLE MENU · VERIFY WITH CAFÉ</span>
                </div>
                <div className="menu-tools">
                  <input aria-label="Search menu" placeholder="Search coffee, rolls, desserts..." value={search} onChange={e => setSearch(e.target.value)} />
                  <div className="category-scroll">
                    {categories.map(c => (
                      <button key={c} className={category === c ? "chip chip-active" : "chip"} onClick={() => setCategory(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="product-grid">
                  {filtered.map((item, i) => (
                    <article className="product-card" key={item.name}>
                      <div className="product-number">{String(i + 1).padStart(2, "0")}</div>
                      <div className="product-category">{item.category}</div>
                      <h3>{item.name}</h3>
                      <p>{item.note}</p>
                      <div className="product-bottom">
                        <strong>₹{item.price}</strong>
                        {item.tag && <span>{item.tag}</span>}
                      </div>
                    </article>
                  ))}
                </div>
                <p className="menu-disclaimer">Items and prices are transcribed from the café concept demo. Confirm current availability and prices with the café staff.</p>
              </div>
            )}

            {tab === "games" && !gameSelected && (
              <div>
                <div className="section-top">
                  <div>
                    <div className="eyebrow">TAKE A QUICK GAME BREAK</div>
                    <h2>Pick your <em>play.</em></h2>
                  </div>
                  <span className="menu-note">1 GAME PLAYABLE</span>
                </div>
                <p className="body-copy">Choose a quick challenge while your order is prepped. Score points to unlock café treats and climb the leaderboard.</p>
                <div className="games-grid">
                  {games.map(g => (
                    <article className={g.live ? "game-card game-live" : "game-card game-locked"} key={g.name}>
                      <div className="game-card-top">
                        <span className="game-emoji">{g.icon}</span>
                        <span className={g.live ? "game-status live" : "game-status"}>{g.label}</span>
                      </div>
                      <h3>{g.name}</h3>
                      <p>{g.detail}</p>
                      <button disabled={!g.live} onClick={() => setGameSelected(true)}>
                        {g.live ? "Play game ↗" : "Coming soon"}
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {tab === "games" && gameSelected && (
              <div className="game-layout">
                <button className="back-link" onClick={() => setGameSelected(false)}>← All games</button>
                <div className="eyebrow">TARGET RUSH · TIMING CHALLENGE</div>
                <h2>Hit the <em>mark.</em></h2>
                <p className="body-copy">Tap anywhere to launch a blade into the rotating disc. Each clean hit scores points and embeds firmly into the rim. Avoid blades already pinned!</p>
                <div
                  className="target-board"
                  ref={boardRef}
                  onPointerDown={throwKnife}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      throwKnife();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="Tap to throw a knife"
                >
                  <div
                    className={targetShudder ? "target-ring target-shudder" : "target-ring"}
                    ref={targetRef}
                    style={{ transform: `rotate(${targetRotation}deg)` }}
                  >
                    <i className="target-center" />
                    {pins.map(pin => {
                      const targetWidth = targetRef.current?.offsetWidth ?? 160;
                      const pinRadius = targetWidth / 2 + TARGET_SPREAD - EMBED_DEPTH;
                      const radians = (pin.angle * Math.PI) / 180;
                      const tipX = Math.cos(radians) * pinRadius;
                      const tipY = Math.sin(radians) * pinRadius;
                      return (
                        <KnifeIcon
                          key={pin.id}
                          className="pinned-knife"
                          style={{
                            left: `calc(50% + ${tipX}px - ${KNIFE_TIP_X}px)`,
                            top: `calc(50% + ${tipY}px - ${KNIFE_TIP_INSET}px)`,
                            transformOrigin: `${KNIFE_TIP_X}px ${KNIFE_TIP_INSET}px`,
                            transform: `rotate(${pin.angle - 90}deg)`
                          }}
                        />
                      );
                    })}
                    <span className="target-mark">✳</span>
                  </div>
                  {gameStarted && (
                    <div
                      key={throwMotion?.id ?? 0}
                      className={throwMotion ? (throwMotion.colliding ? "incoming-knife knife-flight knife-colliding" : "incoming-knife knife-flight") : "incoming-knife"}
                      style={throwMotion ? ({ "--flight-distance": `${throwMotion.distance}px` } as React.CSSProperties) : undefined}
                      aria-hidden="true"
                    >
                      <KnifeIcon />
                    </div>
                  )}
                  <div className="target-board-note">{gameStarted ? gameMessage : score === null ? "TARGET RUSH" : gameMessage}</div>
                </div>
                <div className="game-stats">
                  <div><small>SCORE</small><strong>{gameStarted ? scorePreview : score ?? 0}</strong></div>
                  <div><small>{challengeMode ? "TIME LEFT" : "LEVEL"}</small><strong>{challengeMode ? `${timeLeft}s` : level}</strong></div>
                  <div><small>{challengeMode ? "LEVEL" : "THROWS"}</small><strong>{challengeMode ? level : gameStarted ? throwsLeft : 5}</strong></div>
                  <div><small>BEST</small><strong>{bestScore}</strong></div>
                </div>
                {!gameStarted && (
                  <div className="game-start-options">
                    <button className="btn btn-gold wide" onClick={() => startTargetGame(true)}>
                      {score === null ? "Start 30-second challenge" : "Restart challenge"} ↗
                    </button>
                    <button className="btn btn-navy wide" onClick={() => startTargetGame(false)}>
                      Play levels ↗
                    </button>
                  </div>
                )}
                {gameStarted && (
                  <p className="playing-note">
                    {challengeMode ? "30-second challenge" : `Level ${level} · ${throwsLeft} throws to clear`}. Tap anywhere on the board to throw.
                  </p>
                )}
                {roundTier && !gameStarted && (
                  <div className="result-panel">
                    <div className="eyebrow">YOUR ROUND RESULT</div>
                    <h3>{roundTier.name}</h3>
                    <p>{roundTier.note}</p>
                    {roundTier.discount > 0 && (
                      <button className="btn btn-navy" onClick={() => handleClaimCoupon(`NMN-${roundTier.code.slice(4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, roundTier.discount)}>
                        Claim {roundTier.discount}% reward coupon ↗
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === "leaderboard" && (
              <div className="leaderboard-layout">
                <div className="section-top">
                  <div>
                    <div className="eyebrow">TABLE TOPPERS · HIGH SCORES</div>
                    <h2>The Leaderboard<span className="period">.</span></h2>
                  </div>
                  <div className="timeframe-switch">
                    <button
                      className={leaderboardTimeframe === "weekly" ? "time-chip active" : "time-chip"}
                      onClick={() => setLeaderboardTimeframe("weekly")}
                    >
                      Weekly Scorers
                    </button>
                    <button
                      className={leaderboardTimeframe === "monthly" ? "time-chip active" : "time-chip"}
                      onClick={() => setLeaderboardTimeframe("monthly")}
                    >
                      Monthly Champions
                    </button>
                  </div>
                </div>
                <p className="body-copy">
                  See who is holding the high score across all café tables. Top scorers each week receive complimentary barista specialties.
                </p>

                {/* User's Current Standing Card */}
                <div className="user-standing-card">
                  <div className="standing-left">
                    <span className="standing-badge">YOUR TABLE 04</span>
                    <h3>{bestScore > 0 ? `Best Score: ${bestScore} pts` : "No Score Logged Yet"}</h3>
                    <p>
                      {bestScore >= 23
                        ? "🏆 You've unlocked the 15% Naan-stop Champion reward tier!"
                        : bestScore >= 15
                        ? "🥐 You've unlocked the 10% Roll With It reward tier!"
                        : bestScore >= 8
                        ? "☕ You've unlocked the 5% Coffee Break reward tier!"
                        : "Play Target Rush to set a score and rank among café champions."}
                    </p>
                  </div>
                  <button className="btn btn-gold" onClick={() => { setTab("games"); setGameSelected(true); }}>
                    {bestScore > 0 ? "Play to Climb ↗" : "Play Now ↗"}
                  </button>
                </div>

                {/* Top 3 Podium */}
                <div className="podium-grid">
                  {activeLeaderboard.slice(0, 3).map((item, idx) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    const medalClasses = ["gold-podium", "silver-podium", "bronze-podium"];
                    return (
                      <div className={`podium-card ${medalClasses[idx]} ${item.isUser ? "user-podium" : ""}`} key={item.name + idx}>
                        <div className="podium-medal">{medals[idx]}</div>
                        <div className="podium-avatar">{item.avatar}</div>
                        <h4>{item.name}</h4>
                        <span className="podium-table">{item.table}</span>
                        <div className="podium-score"><strong>{item.score}</strong> <small>pts</small></div>
                        <span className="podium-title">{item.title}</span>
                        <small className="podium-fav">Loves: {item.favorite}</small>
                      </div>
                    );
                  })}
                </div>

                {/* Ranks 4-8 Table */}
                <div className="leaderboard-table">
                  <div className="table-header-row">
                    <span>RANK</span>
                    <span>SCORER</span>
                    <span>TABLE</span>
                    <span>FAVOURITE TREAT</span>
                    <span className="text-right">SCORE</span>
                  </div>
                  {activeLeaderboard.slice(3).map(item => (
                    <div className={`table-data-row ${item.isUser ? "user-row" : ""}`} key={item.name + item.rank}>
                      <span className="rank-num">#{String(item.rank).padStart(2, "0")}</span>
                      <div className="player-info">
                        <strong>{item.name}</strong>
                        <small>{item.title}</small>
                      </div>
                      <span className="player-table">{item.table}</span>
                      <span className="player-fav">{item.favorite}</span>
                      <span className="player-score">{item.score} <small>pts</small></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "rewards" && (
              <div className="rewards-layout">
                <div className="section-top">
                  <div>
                    <div className="eyebrow">A LITTLE THANK-YOU · PLAY & EARN</div>
                    <h2>Rewards & Coupons<span className="period">.</span></h2>
                  </div>
                  <span className="menu-note">TABLE 04 ACTIVE</span>
                </div>
                <p className="body-copy">
                  Score points in Target Rush to claim special café coupons, or enter your promo code below to apply your discount at the counter.
                </p>

                {/* Interactive Coupon Redemption Box */}
                <div className="coupon-redeem-card">
                  <div className="coupon-redeem-header">
                    <span className="coupon-icon">🎟</span>
                    <div>
                      <h3>Redeem Promo or Game Coupon</h3>
                      <p>Enter your code or tap an unlocked voucher below to redeem.</p>
                    </div>
                  </div>

                  <div className="coupon-input-group">
                    <input
                      type="text"
                      placeholder="e.g. NMN-ROLL10 or NMN-CHAMP15"
                      value={couponInput}
                      onChange={e => {
                        setCouponInput(e.target.value);
                        setRedeemError(null);
                      }}
                      className="coupon-input"
                    />
                    <button className="btn btn-navy" onClick={handleApplyCoupon}>
                      Redeem Discount ↗
                    </button>
                  </div>

                  {redeemError && <div className="coupon-error">{redeemError}</div>}

                  {redeemedCode && (
                    <div className="coupon-success-banner">
                      <div className="success-badge">VERIFIED & REDEEMED ✓</div>
                      <div className="success-main">
                        <div>
                          <small>COUPON CODE APPLIED</small>
                          <strong className="code-text">{redeemedCode}</strong>
                          <p><b>{redeemedDiscount}% OFF</b> on one eligible café beverage or bakery item at Table 04.</p>
                        </div>
                        <button className="btn-copy" onClick={() => handleCopy(redeemedCode)}>
                          {copiedCode === redeemedCode ? "Copied! ✓" : "Copy Code"}
                        </button>
                      </div>
                      <div className="success-footer">
                        <span>Show this screen to your barista when paying at the counter.</span>
                        <button className="btn-link" onClick={() => { setRedeemedCode(null); setCouponInput(""); }}>
                          Redeem another code
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="quick-coupon-chips">
                    <small>DEMO TAP-TO-FILL CODES:</small>
                    <button className="sample-chip" onClick={() => setCouponInput("NMN-COFFEE5")}>
                      NMN-COFFEE5 (5% Off)
                    </button>
                    <button className="sample-chip" onClick={() => setCouponInput("NMN-ROLL10")}>
                      NMN-ROLL10 (10% Off)
                    </button>
                    <button className="sample-chip" onClick={() => setCouponInput("NMN-CHAMP15")}>
                      NMN-CHAMP15 (15% Off)
                    </button>
                  </div>
                </div>

                {/* Available Reward Tiers */}
                <h3 className="section-subheading">Unlockable Café Tiers</h3>
                <div className="tier-grid">
                  {tiers.slice(1).map(t => {
                    const isUnlocked = bestScore >= t.min;
                    const demoCode = `${t.code}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
                    return (
                      <div className={`tier-card ${isUnlocked ? "tier-unlocked" : ""}`} key={t.name}>
                        <div className="tier-top">
                          <strong>{t.discount}%</strong>
                          <span className={isUnlocked ? "tier-pill unlocked" : "tier-pill"}>
                            {isUnlocked ? "UNLOCKED ✓" : `SCORE ${t.min}+`}
                          </span>
                        </div>
                        <b>{t.name}</b>
                        <p>{t.note}</p>
                        <button
                          className={`btn wide ${isUnlocked ? "btn-gold" : "btn-navy"}`}
                          onClick={() => {
                            if (isUnlocked) {
                              handleClaimCoupon(t.code, t.discount);
                            } else {
                              setTab("games");
                              setGameSelected(true);
                            }
                          }}
                        >
                          {isUnlocked ? "Claim & Redeem Code ↗" : `Play to Unlock (Need ${Math.max(0, t.min - bestScore)}) ↗`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <nav className="bottom-nav" aria-label="Quick navigation">
            {nav.map(n => (
              <button
                key={n.id}
                className={tab === n.id ? "bottom-link active-bottom" : "bottom-link"}
                onClick={() => {
                  setTab(n.id);
                  if (n.id === "games") setGameSelected(false);
                }}
              >
                <span>{n.icon}</span>
                <small>{n.label}</small>
              </button>
            ))}
          </nav>
        </>
      )}

      <footer className="footer">
        <span>NO MEAT NAAN · ESTD. 2021 · COFFEE SHOP · BAKERY · PÂTISSERIE</span>
        <span>INDEPENDENT CONCEPT · PLAY, CLIMB & EARN</span>
      </footer>
    </main>
  );
}
