import { useState, useEffect } from "react";

const matches = [
  {
    id: 1,
    league: "UEFA Champions League",
    leagueBadge: "⭐",
    home: "Real Madrid",
    away: "Manchester City",
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    status: "LIVE",
    homeBadge: "⚽",
    awayBadge: "🔵",
    homeColor: "#FFFFFF",
    awayColor: "#6CABDD",
    viewers: "142K",
    channel: "UCL TV",
  },
  {
    id: 2,
    league: "Premier League",
    leagueBadge: "🦁",
    home: "Arsenal",
    away: "Chelsea",
    homeScore: 0,
    awayScore: 0,
    minute: 12,
    status: "LIVE",
    homeBadge: "🔴",
    awayBadge: "🔵",
    homeColor: "#EF0107",
    awayColor: "#034694",
    viewers: "98K",
    channel: "Sky Sports",
  },
  {
    id: 3,
    league: "La Liga",
    leagueBadge: "🇪🇸",
    home: "Barcelona",
    away: "Atletico Madrid",
    homeScore: 3,
    awayScore: 2,
    minute: 89,
    status: "LIVE",
    homeBadge: "🔴",
    awayBadge: "🔴",
    homeColor: "#A50044",
    awayColor: "#CB3524",
    viewers: "210K",
    channel: "DAZN",
  },
  {
    id: 4,
    league: "Bundesliga",
    leagueBadge: "🦅",
    home: "Bayern Munich",
    away: "Borussia Dortmund",
    homeScore: null,
    awayScore: null,
    minute: null,
    status: "19:30",
    homeBadge: "🔴",
    awayBadge: "🟡",
    homeColor: "#DC052D",
    awayColor: "#FDE100",
    viewers: null,
    channel: "Sport1",
  },
  {
    id: 5,
    league: "Serie A",
    leagueBadge: "🇮🇹",
    home: "Inter Milan",
    away: "Juventus",
    homeScore: null,
    awayScore: null,
    minute: null,
    status: "21:00",
    homeBadge: "🖤",
    awayBadge: "⚫",
    homeColor: "#010E80",
    awayColor: "#000000",
    viewers: null,
    channel: "DAZN",
  },
];

const featured = matches[0];

function PulsingDot() {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: "#FF3B3B",
        display: "inline-block",
        animation: "pulse 1.4s ease-in-out infinite",
      }} />
    </span>
  );
}

function MinuteBar({ minute }) {
  const pct = Math.min((minute / 90) * 100, 100);
  return (
    <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, marginTop: 6 }}>
      <div style={{
        height: "100%", width: `${pct}%`, borderRadius: 2,
        background: "linear-gradient(90deg, #00E676, #69F0AE)",
        transition: "width 1s ease",
      }} />
    </div>
  );
}

function FeaturedCard({ match, onWatch }) {
  const [tick, setTick] = useState(match.minute);
  useEffect(() => {
    const t = setInterval(() => setTick(p => Math.min(p + 1, 90)), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div onClick={onWatch} style={{
      background: "linear-gradient(135deg, #0D1B2A 0%, #1B2838 60%, #0D2137 100%)",
      borderRadius: 20,
      padding: "22px 20px 18px",
      margin: "0 16px 20px",
      cursor: "pointer",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* glow blobs */}
      <div style={{ position: "absolute", top: -40, left: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(0,230,118,0.07)", filter: "blur(30px)" }} />
      <div style={{ position: "absolute", bottom: -30, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(33,150,243,0.09)", filter: "blur(25px)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: "#B0BEC5", fontFamily: "monospace", letterSpacing: 1 }}>{match.league}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,59,59,0.15)", border: "1px solid rgba(255,59,59,0.4)", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#FF5252", fontWeight: 700, letterSpacing: 1 }}>
          <PulsingDot /> LIVE
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 32 }}>{match.homeBadge}</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginTop: 4, fontFamily: "'Georgia', serif" }}>{match.home}</div>
        </div>
        <div style={{ textAlign: "center", padding: "0 16px" }}>
          <div style={{
            fontSize: 38, fontWeight: 900, color: "#fff",
            fontFamily: "'Courier New', monospace",
            textShadow: "0 0 20px rgba(0,230,118,0.5)",
            letterSpacing: 4,
          }}>
            {match.homeScore} <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 28 }}>:</span> {match.awayScore}
          </div>
          <div style={{ color: "#69F0AE", fontSize: 12, fontWeight: 600 }}>{tick}'</div>
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 32 }}>{match.awayBadge}</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginTop: 4, fontFamily: "'Georgia', serif" }}>{match.away}</div>
        </div>
      </div>

      <MinuteBar minute={tick} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <span style={{ color: "#78909C", fontSize: 11 }}>👁 {match.viewers} watching</span>
        <div style={{
          background: "linear-gradient(135deg, #00E676, #1DE9B6)",
          color: "#000", fontWeight: 800, fontSize: 13,
          padding: "8px 20px", borderRadius: 25,
          letterSpacing: 0.5,
        }}>
          ▶ WATCH NOW
        </div>
      </div>
    </div>
  );
}

function MatchRow({ match, onWatch }) {
  const isLive = match.status === "LIVE";
  return (
    <div onClick={onWatch} style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${isLive ? "rgba(0,230,118,0.2)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 14,
      padding: "14px 16px",
      marginBottom: 10,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 12,
      transition: "background 0.2s",
    }}>
      <div style={{ fontSize: 22, width: 30, textAlign: "center" }}>{match.leagueBadge}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#78909C", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>{match.league}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{match.home}</span>
          <span style={{ color: isLive ? "#69F0AE" : "#B0BEC5", fontWeight: 800, fontSize: 14, fontFamily: "monospace", whiteSpace: "nowrap" }}>
            {isLive ? `${match.homeScore} - ${match.awayScore}` : match.status}
          </span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, flex: 1, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{match.away}</span>
        </div>
      </div>
      {isLive ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#FF5252", fontSize: 10, fontWeight: 700 }}>
          <PulsingDot />{match.minute}'
        </div>
      ) : (
        <span style={{ color: "#455A64", fontSize: 18 }}>›</span>
      )}
    </div>
  );
}

function StreamModal({ match, onClose }) {
  const [volume, setVolume] = useState(70);
  const [quality, setQuality] = useState("HD");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 100,
      display: "flex", flexDirection: "column",
    }}>
      {/* fake video area */}
      <div style={{
        background: "linear-gradient(160deg, #0a0a0a 0%, #1a2332 100%)",
        flex: "0 0 220px",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 50, marginBottom: 8 }}>📺</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Stream loading...</div>
          <div style={{ marginTop: 12, display: "flex", gap: 6, justifyContent: "center" }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: "#00E676",
                animation: `bounce 0.9s ${i * 0.2}s ease-in-out infinite alternate`,
              }} />
            ))}
          </div>
        </div>
        <button onClick={onClose} style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
          width: 36, height: 36, borderRadius: "50%", fontSize: 16, cursor: "pointer",
        }}>✕</button>
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(255,59,59,0.9)", color: "#fff",
          fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 10,
          display: "flex", gap: 4, alignItems: "center",
        }}>
          <PulsingDot /> LIVE
        </span>
      </div>

      {/* match info */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ color: "#78909C", fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>{match.league}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>{match.homeBadge}</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{match.home}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "monospace", textShadow: "0 0 15px rgba(0,230,118,0.6)" }}>
              {match.homeScore} - {match.awayScore}
            </div>
            <div style={{ color: "#69F0AE", fontSize: 11 }}>{match.minute}' | {match.channel}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>{match.awayBadge}</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{match.away}</div>
          </div>
        </div>
      </div>

      {/* controls */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ color: "#78909C", fontSize: 11 }}>🔊 Volume</span>
          <input type="range" min="0" max="100" value={volume}
            onChange={e => setVolume(e.target.value)}
            style={{ accentColor: "#00E676", width: 140 }} />
          <span style={{ color: "#B0BEC5", fontSize: 11, width: 30 }}>{volume}%</span>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {["SD", "HD", "FHD", "4K"].map(q => (
            <button key={q} onClick={() => setQuality(q)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
              background: quality === q ? "#00E676" : "rgba(255,255,255,0.08)",
              color: quality === q ? "#000" : "#78909C",
              border: "none",
            }}>{q}</button>
          ))}
        </div>
      </div>

      {/* stats area */}
      <div style={{ padding: "14px 20px", flex: 1, overflowY: "auto" }}>
        <div style={{ color: "#B0BEC5", fontSize: 12, fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>MATCH STATS</div>
        {[
          { label: "Possession", home: 54, away: 46 },
          { label: "Shots", home: 8, away: 5 },
          { label: "Corners", home: 4, away: 2 },
          { label: "Fouls", home: 7, away: 9 },
        ].map(s => {
          const total = s.home + s.away;
          const homePct = (s.home / total) * 100;
          return (
            <div key={s.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#78909C", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: "#fff", fontWeight: 600 }}>{s.home}{s.label === "Possession" ? "%" : ""}</span>
                <span>{s.label}</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{s.away}{s.label === "Possession" ? "%" : ""}</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${homePct}%`, background: "linear-gradient(90deg, #00E676, #1DE9B6)", borderRadius: "3px 0 0 3px" }} />
                <div style={{ flex: 1, background: "rgba(33,150,243,0.5)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FootballApp() {
  const [tab, setTab] = useState("live");
  const [watching, setWatching] = useState(null);

  const liveMatches = matches.filter(m => m.status === "LIVE");
  const upcomingMatches = matches.filter(m => m.status !== "LIVE");

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto",
      background: "#080E14",
      minHeight: "100vh",
      fontFamily: "'Trebuchet MS', sans-serif",
      color: "#fff",
      paddingBottom: 80,
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
        @keyframes bounce { from{transform:translateY(0)} to{transform:translateY(-6px)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "52px 20px 16px",
        background: "linear-gradient(180deg, #0D1B2A 0%, #080E14 100%)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#00E676", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 2 }}>⚽ FOOTBALL TV</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Live Streams</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "#fff", width: 38, height: 38, borderRadius: "50%", fontSize: 16, cursor: "pointer" }}>🔍</button>
            <button style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "#fff", width: 38, height: 38, borderRadius: "50%", fontSize: 16, cursor: "pointer" }}>🔔</button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", padding: "0 16px", gap: 8, marginBottom: 18 }}>
        {[
          { key: "live", label: `🔴 Live (${liveMatches.length})` },
          { key: "upcoming", label: `🕐 Upcoming` },
          { key: "favorites", label: `⭐ My Teams` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 14px", borderRadius: 22, fontSize: 12, fontWeight: 700,
            cursor: "pointer", border: "none",
            background: tab === t.key ? "#00E676" : "rgba(255,255,255,0.07)",
            color: tab === t.key ? "#000" : "#78909C",
            whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "live" && (
        <>
          {/* Featured */}
          <div style={{ color: "#455A64", fontSize: 10, letterSpacing: 2, padding: "0 20px", marginBottom: 10 }}>FEATURED MATCH</div>
          <FeaturedCard match={featured} onWatch={() => setWatching(featured)} />

          {/* Other live */}
          {liveMatches.length > 1 && (
            <>
              <div style={{ color: "#455A64", fontSize: 10, letterSpacing: 2, padding: "0 20px", marginBottom: 10 }}>ALL LIVE</div>
              <div style={{ padding: "0 16px" }}>
                {liveMatches.slice(1).map(m => (
                  <MatchRow key={m.id} match={m} onWatch={() => setWatching(m)} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {tab === "upcoming" && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ color: "#455A64", fontSize: 10, letterSpacing: 2, marginBottom: 14 }}>TODAY'S SCHEDULE</div>
          {upcomingMatches.map(m => (
            <MatchRow key={m.id} match={m} onWatch={() => {}} />
          ))}
        </div>
      )}

      {tab === "favorites" && (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>⭐</div>
          <div style={{ color: "#B0BEC5", marginTop: 12, fontSize: 14 }}>Follow your favorite teams</div>
          <div style={{ color: "#455A64", fontSize: 12, marginTop: 6 }}>Get notified when they play live</div>
          <button style={{
            marginTop: 20, background: "#00E676", color: "#000",
            border: "none", borderRadius: 25, padding: "12px 28px",
            fontWeight: 800, fontSize: 14, cursor: "pointer",
          }}>Browse Teams</button>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "#0D1B2A",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 20px",
      }}>
        {[
          { icon: "📺", label: "Home" },
          { icon: "🏆", label: "Leagues" },
          { icon: "🔴", label: "Live", active: true },
          { icon: "📅", label: "Schedule" },
          { icon: "👤", label: "Profile" },
        ].map(n => (
          <div key={n.label} style={{ textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 20 }}>{n.icon}</div>
            <div style={{ fontSize: 9, color: n.active ? "#00E676" : "#455A64", marginTop: 2, fontWeight: n.active ? 700 : 400 }}>{n.label}</div>
          </div>
        ))}
      </div>

      {/* Stream modal */}
      {watching && <StreamModal match={watching} onClose={() => setWatching(null)} />}
    </div>
  );
}
