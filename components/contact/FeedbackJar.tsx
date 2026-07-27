"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface FeedbackCardData {
  id: string;
  category: "Kritik" | "Saran" | "Apresiasi" | string;
  author: string;
  message: string;
  timestamp: string;
  drawingDataUrl?: string;
}

interface CustomBody extends Matter.Body {
  cardData?: FeedbackCardData;
}

interface SelectedCardState {
  data: FeedbackCardData;
  origin: { x: number; y: number; angle: number };
}

// Inline icons, same stroke language as ThemeToggle (no emoji as controls)
function ShuffleIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="m15 15 6 6" />
      <path d="M4 4l5 5" />
    </svg>
  );
}

function TossIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="m8 9 4-4 4 4" />
      <path d="m8 15 4 4 4-4" />
    </svg>
  );
}

export default function FeedbackJar() {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

  const [cards, setCards] = useState<FeedbackCardData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<SelectedCardState | null>(null);
  const [isCardModalActive, setIsCardModalActive] = useState<boolean>(false);
  const [justPosted, setJustPosted] = useState<boolean>(false);

  // Form states
  const [category, setCategory] = useState<string>("Apresiasi");
  const [author, setAuthor] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Drawing Pad states
  const [selectedColor, setSelectedColor] = useState<string>("#38bdf8");
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  // Physics engine refs
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const cardBodiesRef = useRef<CustomBody[]>([]);
  const boundaryBodiesRef = useRef<Matter.Body[]>([]);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const [allDbCards, setAllDbCards] = useState<FeedbackCardData[]>([]);

  // Get max allowed cards depending on device screen size (max 6 on mobile)
  const getBatchLimit = () => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return 6;
    }
    return 10;
  };

  // Helper to shuffle & load a random batch of cards into the physics engine
  const loadRandomBatch = (cardList: FeedbackCardData[]) => {
    if (!cardList || cardList.length === 0) return;

    // Clear existing physics bodies
    const { Composite } = Matter;
    if (engineRef.current) {
      cardBodiesRef.current.forEach((b) => Composite.remove(engineRef.current!.world, b));
    }
    cardBodiesRef.current = [];

    // Shuffle list randomly
    const shuffled = [...cardList].sort(() => Math.random() - 0.5);
    const limit = getBatchLimit();
    const batch = shuffled.slice(0, limit);

    setCards(batch);

    if (canvasRef.current && engineRef.current) {
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      loadCardsIntoPhysics(batch, w, h, engineRef.current);
    }
  };

  // Initialize saved cards from Neon DB API
  useEffect(() => {
    fetch("/api/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.cards) && data.cards.length > 0) {
          setAllDbCards(data.cards);
          loadRandomBatch(data.cards);
        }
      })
      .catch((err) => {
        console.error("Failed to load feedback from API:", err);
      });
  }, []);

  // Modal animation sync
  useEffect(() => {
    if (selectedCard) {
      const timer = requestAnimationFrame(() => {
        setIsCardModalActive(true);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setIsCardModalActive(false);
    }
  }, [selectedCard]);

  // Drawing Pad Canvas setup when modal opens
  useEffect(() => {
    if (isFormOpen && drawingCanvasRef.current) {
      const canvas = drawingCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    }
  }, [isFormOpen]);

  const openCardDetail = (body: CustomBody) => {
    if (!body.cardData || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const originX = canvasRect.left + body.position.x;
    const originY = canvasRect.top + body.position.y;
    const angleDeg = (body.angle * 180) / Math.PI;

    setSelectedCard({
      data: body.cardData,
      origin: { x: originX, y: originY, angle: angleDeg },
    });
  };

  const closeCardModal = () => {
    setIsCardModalActive(false);
    setTimeout(() => {
      setSelectedCard(null);
    }, 360);
  };

  // Helper to load / cache images for 60fps canvas rendering
  const getCachedImage = (dataUrl?: string): HTMLImageElement | null => {
    if (!dataUrl) return null;
    if (imageCache.current.has(dataUrl)) {
      const img = imageCache.current.get(dataUrl)!;
      return img.complete ? img : null;
    }
    const img = new Image();
    img.src = dataUrl;
    imageCache.current.set(dataUrl, img);
    return null;
  };

  // Main Matter.js Physics setup
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { Engine, Runner, Mouse, MouseConstraint, Composite, Events, Bounds } = Matter;

    const engine = Engine.create({
      positionIterations: 10,
      velocityIterations: 10,
      gravity: { x: 0, y: 0.6, scale: 0.001 },
    });
    engineRef.current = engine;

    const updateCanvasSize = () => {
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 520;

      canvas.width = width;
      canvas.height = height;

      setupBoundaries(width, height, engine);
    };

    updateCanvasSize();

    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        damping: 0.12,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);

    let dragStartPos = { x: 0, y: 0 };
    let dragStartTime = 0;

    Events.on(mouseConstraint, "mousedown", (evt: any) => {
      dragStartPos = { x: evt.mouse.position.x, y: evt.mouse.position.y };
      dragStartTime = Date.now();
    });

    Events.on(mouseConstraint, "mouseup", (evt: any) => {
      const mousePos = evt.mouse.position;
      const dist = Math.hypot(mousePos.x - dragStartPos.x, mousePos.y - dragStartPos.y);
      const duration = Date.now() - dragStartTime;

      if (dist < 10 && duration < 350) {
        const allBodies = Composite.allBodies(engine.world) as CustomBody[];
        const clickedBody = allBodies.find(
          (b) => b.label === "card" && b.cardData && Bounds.contains(b.bounds, mousePos)
        );

        if (clickedBody) {
          openCardDetail(clickedBody);
        }
      }
    });

    const initialList = JSON.parse(localStorage.getItem("kiya_feedback_cards") || "[]");
    const cardsToLoad = initialList.length > 0 ? initialList : cards;
    loadCardsIntoPhysics(cardsToLoad, canvas.width, canvas.height, engine);

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    let animationFrameId: number;
    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw dark grid background
      drawGridBackground(ctx, canvas.width, canvas.height);

      // Render physics card bodies
      const allBodies = Composite.allBodies(engine.world) as CustomBody[];
      allBodies.forEach((body) => {
        if (body.label === "card") {
          drawPolaroidCardBody(ctx, body);
        }
      });

      // Render elastic drag spring line
      if (mouseConstraint.body) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(mouseConstraint.body.position.x, mouseConstraint.body.position.y);
        ctx.lineTo(mouseConstraint.mouse.position.x, mouseConstraint.mouse.position.y);
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      Runner.stop(runner);
      Engine.clear(engine);
    };
  }, []);

  const setupBoundaries = (w: number, h: number, engine: Matter.Engine) => {
    const { Bodies, Composite } = Matter;

    if (boundaryBodiesRef.current.length > 0) {
      Composite.remove(engine.world, boundaryBodiesRef.current);
      boundaryBodiesRef.current = [];
    }

    const floor = Bodies.rectangle(w / 2, h + 25, w * 2, 50, { isStatic: true, friction: 0.9 });
    const leftWall = Bodies.rectangle(-25, h / 2, 50, h * 2, { isStatic: true });
    const rightWall = Bodies.rectangle(w + 25, h / 2, 50, h * 2, { isStatic: true });

    const boundaries = [floor, leftWall, rightWall];
    boundaryBodiesRef.current = boundaries;
    Composite.add(engine.world, boundaries);
  };

  const loadCardsIntoPhysics = (cardsList: FeedbackCardData[], w: number, h: number, engine: Matter.Engine) => {
    cardsList.forEach((card, i) => {
      const spawnX = Math.min(Math.max(100 + (i % 3) * 140, 80), w - 80);
      const spawnY = Math.max(h - 120 - i * 45, 100);
      spawnCardPhysicsBody(card, { x: spawnX, y: spawnY }, engine);
    });
  };

  const spawnCardPhysicsBody = (cardData: FeedbackCardData, pos: { x: number; y: number }, engineInstance?: Matter.Engine) => {
    const { Bodies, Composite } = Matter;
    const targetEngine = engineInstance || engineRef.current;
    if (!targetEngine) return;

    const cardWidth = 135;
    const cardHeight = 165;

    const cardBody: CustomBody = Bodies.rectangle(pos.x, pos.y, cardWidth, cardHeight, {
      label: "card",
      friction: 0.85,
      frictionStatic: 1.0,
      frictionAir: 0.06,
      restitution: 0.08,
      density: 0.0012,
      chamfer: { radius: 10 },
      angle: (Math.random() - 0.5) * 0.3,
    });

    cardBody.cardData = cardData;
    cardBodiesRef.current.push(cardBody);
    Composite.add(targetEngine.world, cardBody);
  };

  // Drawing Pad Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext("2d");
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingCanvasRef.current) return;
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = selectedColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearDrawingCanvas = () => {
    if (!drawingCanvasRef.current) return;
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !message.trim()) return;

    let drawingUrl: string | undefined = undefined;
    if (drawingCanvasRef.current && hasDrawn) {
      drawingUrl = drawingCanvasRef.current.toDataURL();
    }

    const newCard: FeedbackCardData = {
      id: "card_" + Date.now(),
      category,
      author,
      message,
      timestamp: lang === "id" ? "Hari ini" : "Today",
      drawingDataUrl: drawingUrl,
    };

    const updated = [newCard, ...cards];
    setCards(updated);
    localStorage.setItem("kiya_feedback_cards", JSON.stringify(updated));

    const updatedAll = [newCard, ...allDbCards];
    setAllDbCards(updatedAll);

    // Save to Neon DB API
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCard),
    }).catch((err) => console.error("Failed to save card to API:", err));

    if (canvasRef.current) {
      const spawnX = canvasRef.current.width / 2 + (Math.random() * 60 - 30);
      const spawnY = 80;
      spawnCardPhysicsBody(newCard, { x: spawnX, y: spawnY });
    }

    setAuthor("");
    setMessage("");
    setIsFormOpen(false);
    setJustPosted(true);
  };

  // Clear the "thanks" confirmation a few seconds after posting
  useEffect(() => {
    if (!justPosted) return;
    const timer = setTimeout(() => setJustPosted(false), 4000);
    return () => clearTimeout(timer);
  }, [justPosted]);

  const handleShakeBoard = () => {
    const { Body } = Matter;
    cardBodiesRef.current.forEach((body) => {
      const forceX = (Math.random() - 0.5) * 0.08;
      const forceY = -0.05 - Math.random() * 2;
      Body.applyForce(body, body.position, { x: forceX, y: forceY });
    });
  };

  const handleShuffleCards = () => {
    loadRandomBatch(allDbCards.length > 0 ? allDbCards : cards);
  };

  const drawGridBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.fillStyle = "#0c0c0e";
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 24;

    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Polaroid Style Physics Card Renderer (Matching user's attached screenshot)
  const drawPolaroidCardBody = (ctx: CanvasRenderingContext2D, body: CustomBody) => {
    const card = body.cardData;
    if (!card) return;

    const width = 135;
    const height = 165;

    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);

    // Card Box Shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Card Main Container (Dark Polaroid Frame)
    ctx.fillStyle = "#1a1a1e";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(-width / 2, -height / 2, width, height, 10);
    } else {
      ctx.rect(-width / 2, -height / 2, width, height);
    }
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = "transparent";

    // Top Square Doodle Image Canvas Box
    const imageSize = 119;
    const imageX = -imageSize / 2;
    const imageY = -height / 2 + 8;

    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(imageX, imageY, imageSize, imageSize, 6);
    } else {
      ctx.rect(imageX, imageY, imageSize, imageSize);
    }
    ctx.fill();

    // Render User's Hand-Drawn Doodle if present
    if (card.drawingDataUrl) {
      const img = getCachedImage(card.drawingDataUrl);
      if (img) {
        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(imageX, imageY, imageSize, imageSize, 6);
        } else {
          ctx.rect(imageX, imageY, imageSize, imageSize);
        }
        ctx.clip();
        ctx.drawImage(img, imageX, imageY, imageSize, imageSize);
        ctx.restore();
      }
    }

    // Bottom Metadata Area
    const categoryColor =
      card.category === "Kritik"
        ? "#f43f5e"
        : card.category === "Saran"
        ? "#38bdf8"
        : "#4ade80";

    // Category Indicator Dot
    ctx.fillStyle = categoryColor;
    ctx.beginPath();
    ctx.arc(-width / 2 + 12, height / 2 - 26, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Author Name
    ctx.fillStyle = "#9e9ea6";
    ctx.font = "bold 9px monospace";
    const authorText = card.author.length > 13 ? card.author.substring(0, 12) + ".." : card.author;
    ctx.fillText(authorText, -width / 2 + 20, height / 2 - 23);

    // Message snippet
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10.5px sans-serif";
    const msgText = card.message.length > 17 ? card.message.substring(0, 15) + "..." : card.message;
    ctx.fillText(msgText, -width / 2 + 12, height / 2 - 9);

    ctx.restore();
  };

  const totalNotes = allDbCards.length || cards.length;

  return (
    <div className="w-full rounded-xl border border-line bg-surface p-4 sm:p-5">
      {/* Masthead */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {lang === "id" ? "Papan Apresiasi" : "Wall of Fame"}
          </p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-text">
            {totalNotes}{" "}
            <span className="text-text-2">
              {lang === "id"
                ? totalNotes === 1
                  ? "catatan"
                  : "catatan"
                : totalNotes === 1
                  ? "note"
                  : "notes"}
            </span>
          </h3>
          <p className="mt-0.5 text-sm text-text-2">
            {lang === "id"
              ? "Coretan dan pesan yang ditinggalkan pengunjung."
              : "Doodles and messages left by people who stopped by."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {justPosted && (
            <span
              role="status"
              className="hidden font-mono text-xs text-accent sm:inline"
            >
              {lang === "id" ? "Catatanmu tertempel." : "Your note is up."}
            </span>
          )}

          <div
            role="group"
            aria-label={lang === "id" ? "Aksi papan" : "Board actions"}
            className="flex items-center gap-1"
          >
            <button
              type="button"
              onClick={handleShakeBoard}
              aria-label={lang === "id" ? "Kocok kartu" : "Toss the cards"}
              title={lang === "id" ? "Kocok kartu" : "Toss the cards"}
              className="flex h-11 w-11 items-center justify-center rounded-md border border-line bg-bg text-text-2 transition-colors duration-150 hover:border-accent hover:text-accent sm:h-9 sm:w-9"
            >
              <TossIcon />
            </button>

            <button
              type="button"
              onClick={handleShuffleCards}
              aria-label={lang === "id" ? "Tampilkan kartu lain" : "Show a different set"}
              title={lang === "id" ? "Tampilkan kartu lain" : "Show a different set"}
              className="flex h-11 w-11 items-center justify-center rounded-md border border-line bg-bg text-text-2 transition-colors duration-150 hover:border-accent hover:text-accent sm:h-9 sm:w-9"
            >
              <ShuffleIcon />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="min-h-11 rounded-md border border-accent bg-accent px-4 font-mono text-xs font-semibold text-bg transition-opacity duration-150 hover:opacity-90 sm:min-h-9"
          >
            {lang === "id" ? "Tinggalkan catatan" : "Leave a note"}
          </button>
        </div>
      </div>

      {/* Physics Canvas Area */}
      <div
        ref={containerRef}
        className="relative h-[480px] w-full overflow-hidden rounded-lg border border-line bg-bg"
      >
        <canvas ref={canvasRef} className="block h-full w-full cursor-grab active:cursor-grabbing" />

        {cards.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center">
            <p className="text-sm text-text-2">
              {lang === "id"
                ? "Papannya masih kosong."
                : "Nothing on the wall yet."}
            </p>
            <p className="font-mono text-xs text-text-2/70">
              {lang === "id"
                ? "Jadi yang pertama menempel catatan."
                : "Be the first to pin something up."}
            </p>
          </div>
        )}
      </div>

      <p className="mt-2.5 font-mono text-xs text-text-2/70">
        {lang === "id"
          ? "Seret kartu untuk memindahkan · Klik untuk membaca"
          : "Drag a card to move it · Click to read it"}
      </p>

      {/* Form & Drawing Pad Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-2xl my-auto">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-sm text-text-2 hover:text-text"
            >
              ✕
            </button>

            <h4 className="font-mono text-base font-semibold tracking-tight text-text">
              {lang === "id" ? "Buat Kartu Doodle & Feedback" : "Create Doodle Card & Feedback"}
            </h4>
            <p className="mt-1 text-xs text-text-2 mb-4">
              {lang === "id"
                ? "Gambar lukisan bebas di kanvas lalu isi masukanmu."
                : "Draw a doodle on the canvas and submit your feedback."}
            </p>

            <form onSubmit={handleAddCard} className="space-y-4">
              {/* Category Radio Selector */}
              <div>
                <label className="block font-mono text-xs text-text-2 mb-1.5">
                  {lang === "id" ? "Kategori Masukan" : "Feedback Criteria"}
                </label>
                <div className="flex items-center gap-2.5 font-mono text-xs">
                  {[
                    { id: "Kritik", label: "Kritik", color: "text-rose-400 border-rose-500/30" },
                    { id: "Saran", label: "Saran", color: "text-sky-400 border-sky-500/30" },
                    { id: "Apresiasi", label: "Apresiasi", color: "text-emerald-400 border-emerald-500/30" },
                  ].map((cat) => (
                    <label
                      key={cat.id}
                      className={`flex cursor-pointer items-center gap-1.5 rounded border px-3 py-1.5 transition-colors ${
                        category === cat.id
                          ? "border-accent bg-accent/10 text-accent font-semibold"
                          : "border-line text-text-2 hover:border-text-2"
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={category === cat.id}
                        onChange={(e) => setCategory(e.target.value)}
                        className="sr-only"
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Drawing Pad Canvas */}
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-text-2 mb-1.5">
                  <span>{lang === "id" ? "Kanvas coretan" : "Doodle canvas"}</span>
                  <button
                    type="button"
                    onClick={clearDrawingCanvas}
                    className="text-xs text-text-2 transition-colors hover:text-rose-400"
                  >
                    {lang === "id" ? "Hapus" : "Clear"}
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-lg border border-line bg-slate-200">
                  <canvas
                    ref={drawingCanvasRef}
                    width={400}
                    height={300}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className="block w-full h-44 cursor-crosshair touch-none"
                  />
                </div>

                {/* Color & Brush Palette Controls */}
                <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {["#0f172a", "#f43f5e", "#38bdf8", "#4ade80", "#facc15", "#a855f7"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        className={`h-6 w-6 rounded-full border border-white/20 transition-transform ${
                          selectedColor === color ? "scale-125 ring-2 ring-accent" : "hover:scale-110"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-2">
                    <span>Size:</span>
                    {[2, 4, 8].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setBrushSize(size)}
                        className={`rounded border px-2 py-0.5 ${
                          brushSize === size
                            ? "border-accent bg-accent/10 text-accent font-bold"
                            : "border-line text-text-2"
                        }`}
                      >
                        {size === 2 ? "Fine" : size === 4 ? "Mid" : "Bold"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Author & Message Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="author-input" className="block font-mono text-xs text-text-2 mb-1">
                    {lang === "id" ? "Nama / Username" : "Name / Handle"}
                  </label>
                  <input
                    id="author-input"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="@username"
                    required
                    className="w-full rounded-md border border-line bg-bg px-3 py-2 text-xs text-text placeholder:text-text-2/50 focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="message-input" className="block font-mono text-xs text-text-2 mb-1">
                    {lang === "id" ? "Pesan Singkat" : "Short Note"}
                  </label>
                  <input
                    id="message-input"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={lang === "id" ? "Catatan masukan..." : "Short message..."}
                    required
                    className="w-full rounded-md border border-line bg-bg px-3 py-2 text-xs text-text placeholder:text-text-2/50 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-md border border-accent bg-accent px-4 py-2.5 font-mono text-xs font-semibold text-bg transition-opacity hover:opacity-90 mt-2"
              >
                {lang === "id" ? "Terbitkan Kartu Doodle" : "Publish Doodle Card"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Read Note Expand Modal - Animates from origin card position */}
      {selectedCard && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${
            isCardModalActive ? "bg-bg/85 backdrop-blur-sm" : "bg-transparent pointer-events-none"
          }`}
          onClick={closeCardModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: isCardModalActive ? "50%" : `${selectedCard.origin.y}px`,
              left: isCardModalActive ? "50%" : `${selectedCard.origin.x}px`,
              transform: isCardModalActive
                ? "translate(-50%, -50%) rotate(0deg) scale(1)"
                : `translate(-50%, -50%) rotate(${selectedCard.origin.angle}deg) scale(0.28)`,
              opacity: isCardModalActive ? 1 : 0,
              transition: "all 380ms cubic-bezier(0.16, 1, 0.3, 1)",
              transformOrigin: "center center",
            }}
            className="w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={closeCardModal}
              className="absolute top-4 right-4 z-10 rounded-full bg-bg/80 p-1.5 text-xs text-text-2 hover:text-text"
            >
              ✕
            </button>

            {/* Expanded Doodle Image */}
            {selectedCard.data.drawingDataUrl && (
              <div className="mb-4 overflow-hidden rounded-xl border border-line bg-slate-200">
                <img
                  src={selectedCard.data.drawingDataUrl}
                  alt="Doodle"
                  className="w-full h-56 object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between font-mono text-xs text-text-2 mb-2">
              <span className="font-semibold text-accent">[{selectedCard.data.category}]</span>
              <span>{selectedCard.data.timestamp}</span>
            </div>

            <p className="text-base font-medium leading-relaxed text-text mb-4">
              "{selectedCard.data.message}"
            </p>

            <div className="flex justify-between items-center border-t border-line pt-3 text-xs">
              <span className="font-mono text-text-2">{lang === "id" ? "Oleh:" : "By:"}</span>
              <span className="font-mono font-bold text-accent">{selectedCard.data.author}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}