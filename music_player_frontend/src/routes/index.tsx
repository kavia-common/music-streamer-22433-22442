import { $, component$, useOnWindow, useSignal, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

/** Types for mock data */
type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  cover?: string;
  audioUrl: string;
  tags?: string[];
};

type Playlist = {
  id: string;
  name: string;
  tracks: string[]; // track ids
};

// Mock data
const MOCK_TRACKS: Track[] = [
  {
    id: "t1",
    title: "Ocean Drive",
    artist: "Blue Harbor",
    album: "Deep Currents",
    duration: 228,
    audioUrl: "/sample-audio/track1.mp3",
    tags: ["Chill", "Instrumental"],
  },
  {
    id: "t2",
    title: "Amber Sunset",
    artist: "Coastal Lights",
    album: "Sea & Sky",
    duration: 201,
    audioUrl: "/sample-audio/track2.mp3",
    tags: ["Ambient"],
  },
  {
    id: "t3",
    title: "Waves and Wind",
    artist: "North Tide",
    album: "Bayside",
    duration: 254,
    audioUrl: "/sample-audio/track3.mp3",
    tags: ["Chill", "Acoustic"],
  },
  {
    id: "t4",
    title: "Sailing Night",
    artist: "Marina",
    album: "Harbor Lights",
    duration: 192,
    audioUrl: "/sample-audio/track4.mp3",
    tags: ["Electronic"],
  },
  {
    id: "t5",
    title: "Blue Horizon",
    artist: "Skyline",
    album: "Above Water",
    duration: 236,
    audioUrl: "/sample-audio/track5.mp3",
    tags: ["Pop"],
  },
];

const MOCK_PLAYLISTS: Playlist[] = [
  { id: "p1", name: "Favorites", tracks: ["t1", "t3", "t5"] },
  { id: "p2", name: "Chill Mix", tracks: ["t1", "t2", "t3"] },
  { id: "p3", name: "Workout", tracks: ["t4", "t5"] },
];

// Helper to format seconds
const fmtTime = (s: number) => {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
};

// PUBLIC_INTERFACE
export default component$(() => {
  // Signals: state
  const query = useSignal("");
  const activePlaylist = useSignal<Playlist | null>(MOCK_PLAYLISTS[0]);
  const filteredTracks = useSignal<Track[]>(MOCK_TRACKS);
  const currentTrack = useSignal<Track | null>(MOCK_TRACKS[0]);
  const isPlaying = useSignal(false);
  const progressPct = useSignal(0);
  const audioRef = useSignal<HTMLAudioElement>();

  // Filter logic
  useTask$(({ track }) => {
    track(() => query.value);
    track(() => activePlaylist.value?.id);
    const q = query.value.toLowerCase().trim();

    let pool = MOCK_TRACKS;
    if (activePlaylist.value) {
      pool = pool.filter((t) => activePlaylist.value!.tracks.includes(t.id));
    }
    if (q) {
      pool = pool.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          (t.tags || []).some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    filteredTracks.value = pool;
  });

  // Playback listeners
  useOnWindow(
    "keydown",
    $((ev) => {
      if ((ev as KeyboardEvent).code === "Space") {
        ev.preventDefault();
        togglePlay$();
      }
    }),
  );

  const togglePlay$ = $(() => {
    if (!audioRef.value) return;
    if (isPlaying.value) {
      audioRef.value.pause();
      isPlaying.value = false;
    } else {
      audioRef.value.play().catch(() => {});
      isPlaying.value = true;
    }
  });

  const playTrack$ = $((t: Track) => {
    currentTrack.value = t;
    if (!audioRef.value) return;
    audioRef.value.src = t.audioUrl;
    audioRef.value.play().catch(() => {});
    isPlaying.value = true;
  });

  const nextTrack$ = $(() => {
    const list = filteredTracks.value.length ? filteredTracks.value : MOCK_TRACKS;
    if (!currentTrack.value) {
      playTrack$(list[0]);
      return;
    }
    const idx = list.findIndex((x) => x.id === currentTrack.value!.id);
    const nxt = list[(idx + 1) % list.length];
    if (nxt) playTrack$(nxt);
  });

  const prevTrack$ = $(() => {
    const list = filteredTracks.value.length ? filteredTracks.value : MOCK_TRACKS;
    if (!currentTrack.value) {
      playTrack$(list[0]);
      return;
    }
    const idx = list.findIndex((x) => x.id === currentTrack.value!.id);
    const prev = list[(idx - 1 + list.length) % list.length];
    playTrack$(prev);
  });

  const onTimeUpdate$ = $(() => {
    if (!audioRef.value) return;
    const a = audioRef.value;
    if (a.duration > 0) {
      progressPct.value = (a.currentTime / a.duration) * 100;
    }
  });

  const onEnded$ = $(() => {
    nextTrack$();
  });

  return (
    <div class="container-app">
      {/* Header */}
      <header class="header">
        <div class="header-inner">
          <div class="brand">
            <div class="brand-logo" aria-hidden="true" />
            <div>
              <div class="brand-title">Ocean Player</div>
              <div style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
                Blue & Amber. Minimal. Professional.
              </div>
            </div>
          </div>
          <nav class="nav" aria-label="Primary">
            <a class="nav-btn active" href="#">Browse</a>
            <a class="nav-btn" href="#">Playlists</a>
            <a class="nav-btn" href="#">Library</a>
          </nav>
        </div>
      </header>

      {/* Main Layout */}
      <div class="layout">
        {/* Sidebar: Playlists */}
        <aside class="sidebar" aria-label="Playlists">
          <div class="sidebar-header">Playlists</div>
          <div class="sidebar-section">
            {MOCK_PLAYLISTS.map((pl) => (
              <button
                key={pl.id}
                class={{
                  "playlist-item": true,
                  active: activePlaylist.value?.id === pl.id,
                }}
                onClick$={() => {
                  activePlaylist.value =
                    activePlaylist.value?.id === pl.id ? null : pl;
                }}
                aria-pressed={activePlaylist.value?.id === pl.id}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "999px",
                    background:
                      activePlaylist.value?.id === pl.id
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontWeight: 600 }}>{pl.name}</span>
                <span style={{ color: "var(--color-muted)", marginLeft: "auto" }}>
                  {pl.tracks.length}
                </span>
              </button>
            ))}
          </div>

          <div class="sidebar-header">Tags</div>
          <div class="sidebar-section" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["Chill", "Ambient", "Acoustic", "Electronic", "Pop"].map((t) => (
              <button
                class="badge"
                key={t}
                onClick$={() => {
                  query.value = t;
                }}
                aria-label={`Filter by ${t}`}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "var(--color-secondary)",
                    borderRadius: "999px",
                  }}
                />
                {t}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <section class="main">
          <div class="card">
            <div class="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
                  Tracks
                </span>
                <span class="badge">
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      background: "var(--color-secondary)",
                      borderRadius: "999px",
                    }}
                  />
                  {filteredTracks.value.length} items
                </span>
              </div>
              <div class="search">
                <input
                  class="input"
                  placeholder="Search by title, artist, album or tag..."
                  value={query.value}
                  onInput$={(e) => (query.value = (e.target as HTMLInputElement).value)}
                  aria-label="Search"
                />
                <button class="btn-primary" onClick$={() => (query.value = "")}>
                  Clear
                </button>
              </div>
            </div>

            <div class="tracks" role="list">
              {filteredTracks.value.map((t) => (
                <article class="track-card" key={t.id} role="listitem">
                  <div class="track-cover" aria-hidden="true" />
                  <div>
                    <div class="track-title">{t.title}</div>
                    <div class="track-meta">
                      {t.artist} • {t.album}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div class="track-meta">{fmtTime(t.duration)}</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button class="btn-ghost" onClick$={() => playTrack$(t)}>
                        Play
                      </button>
                      <button
                        class="btn-ghost"
                        onClick$={() => {
                          // Add to Favorites (mock)
                          alert(`Added "${t.title}" to Favorites (mock).`);
                        }}
                      >
                        + Fav
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Player */}
      <footer class="player" aria-label="Player controls">
        <div class="info">
          <div class="cover-sm" aria-hidden="true" />
          <div style={{ minWidth: 0 }}>
            <div class="title">
              {currentTrack.value ? currentTrack.value.title : "Nothing playing"}
            </div>
            <div style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
              {currentTrack.value
                ? `${currentTrack.value.artist} • ${currentTrack.value.album}`
                : "Select a track to start listening"}
            </div>
          </div>
        </div>

        <div class="controls" role="group" aria-label="Playback">
          <button class="icon-btn" onClick$={prevTrack$} aria-label="Previous">
            ◄◄
          </button>
          <button
            class={{ "icon-btn": true, primary: true }}
            onClick$={togglePlay$}
            aria-label={isPlaying.value ? "Pause" : "Play"}
          >
            {isPlaying.value ? "❚❚" : "►"}
          </button>
          <button class="icon-btn" onClick$={nextTrack$} aria-label="Next">
            ►►
          </button>
        </div>

        <div class="progress" aria-label="Progress">
          <div class="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct.value)}>
            <div class="progress-fill" style={{ width: `${progressPct.value}%` }} />
          </div>
          <div style={{ minWidth: "56px", textAlign: "right" }}>
            {currentTrack.value ? fmtTime(currentTrack.value.duration) : "--:--"}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={currentTrack.value?.audioUrl}
          onTimeUpdate$={onTimeUpdate$}
          onEnded$={onEnded$}
          onPlay$={() => (isPlaying.value = true)}
          onPause$={() => (isPlaying.value = false)}
          style={{ display: "none" }}
        />
      </footer>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ocean Player - Music",
  meta: [
    {
      name: "description",
      content:
        "A modern web-based music player with playlists and track browsing, built with Qwik.",
    },
  ],
};
