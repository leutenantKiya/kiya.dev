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

// Generate default preset doodle cards with cute initial drawings
function createDefaultDoodles(lang: string): FeedbackCardData[] {
  // Helper to create simple canvas doodle Data URLs for default cards
  if (typeof window === "undefined") return [];

  const createDoodleUrl = (drawFn: (ctx: CanvasRenderingContext2D) => void) => {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, 0, 200, 180);
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    drawFn(ctx);
    return canvas.toDataURL();
  };

  const smileyUrl = createDoodleUrl((ctx) => {
    // Face
    ctx.beginPath();
    ctx.arc(100, 85, 45, 0, Math.PI * 2);
    ctx.stroke();
    // Eyes
    ctx.beginPath();
    ctx.arc(82, 72, 6, 0, Math.PI * 2);
    ctx.arc(118, 72, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    // Smile
    ctx.beginPath();
    ctx.arc(100, 85, 26, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  });

  const heartUrl = createDoodleUrl((ctx) => {
    ctx.strokeStyle = "#f43f5e";
    ctx.fillStyle = "#f43f5e22";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(100, 130);
    ctx.bezierCurveTo(40, 75, 40, 35, 100, 55);
    ctx.bezierCurveTo(160, 35, 160, 75, 100, 130);
    ctx.fill();
    ctx.stroke();
  });

  const catUrl = createDoodleUrl((ctx) => {
    // Cat ears
    ctx.beginPath();
    ctx.moveTo(55, 65);
    ctx.lineTo(40, 25);
    ctx.lineTo(80, 45);
    ctx.lineTo(120, 45);
    ctx.lineTo(160, 25);
    ctx.lineTo(145, 65);
    // Face outline
    ctx.bezierCurveTo(175, 95, 175, 135, 100, 135);
    ctx.bezierCurveTo(25, 135, 25, 95, 55, 65);
    ctx.stroke();
    // Eyes
    ctx.beginPath();
    ctx.arc(75, 80, 5, 0, Math.PI * 2);
    ctx.arc(125, 80, 5, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.beginPath();
    ctx.arc(90, 100, 10, 0, Math.PI);
    ctx.arc(110, 100, 10, 0, Math.PI);
    ctx.stroke();
  });

  const greatWorkUrl = createDoodleUrl((ctx) => {
    ctx.strokeStyle = "#38bdf8";
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Great", 50, 70);
    ctx.fillText("Work! 🚀", 50, 110);
  });

  return [
    {
      id: "preset_1",
      category: "Apresiasi",
      author: "@BitMantis",
      message: lang === "id" ? "Portofolio keren banget!" : "Very cool portfolio!",
      timestamp: lang === "id" ? "Hari ini" : "Today",
      drawingDataUrl: smileyUrl,
    },
    {
      id: "preset_2",
      category: "Apresiasi",
      author: "@Shubu",
      message: lang === "id" ? "Fitur masukan yang bagus" : "Nice interactive feature",
      timestamp: lang === "id" ? "Hari ini" : "Today",
      drawingDataUrl: catUrl,
    },
    {
      id: "preset_3",
      category: "Saran",
      author: "@Arsam",
      message: lang === "id" ? "Website luar biasa" : "Awesome website",
      timestamp: lang === "id" ? "Hari ini" : "Today",
      drawingDataUrl: greatWorkUrl,
    },
    {
      id: "preset_4",
      category: "Apresiasi",
      author: "@Bee",
      message: lang === "id" ? "Sangat bagus!" : "That's nice!",
      timestamp: lang === "id" ? "Hari ini" : "Today",
      drawingDataUrl: heartUrl,
    },
  ];
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

  // Initialize saved or default cards
  useEffect(() => {
    const saved = localStorage.getItem("kiya_feedback_cards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCards(parsed.length > 0 ? parsed : createDefaultDoodles(lang));
      } catch (e) {
        setCards(createDefaultDoodles(lang));
      }
    } else {
      const defaults = createDefaultDoodles(lang);
      setCards(defaults);
      localStorage.setItem("kiya_feedback_cards", JSON.stringify(defaults));
    }
  }, [lang]);

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

    if (canvasRef.current) {
      const spawnX = canvasRef.current.width / 2 + (Math.random() * 60 - 30);
      const spawnY = 80;
      spawnCardPhysicsBody(newCard, { x: spawnX, y: spawnY });
    }

    setAuthor("");
    setMessage("");
    setIsFormOpen(false);
  };

  const handleShakeBoard = () => {
    const { Body } = Matter;
    cardBodiesRef.current.forEach((body) => {
      const forceX = (Math.random() - 0.5) * 0.08;
      const forceY = -0.05 - Math.random() * 0.04;
      Body.applyForce(body, body.position, { x: forceX, y: forceY });
    });
  };

  const handleClearCards = () => {
    const { Composite } = Matter;
    if (engineRef.current) {
      cardBodiesRef.current.forEach((b) => Composite.remove(engineRef.current!.world, b));
    }
    cardBodiesRef.current = [];
    setCards([]);
    localStorage.removeItem("kiya_feedback_cards");
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

  return (
    <div className="w-full rounded-xl border border-line bg-surface p-4 sm:p-5">
      {/* Top Bar matching screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-line bg-bg px-2.5 py-1 font-mono text-xs text-text">
            <span>📄</span>
            <span className="font-bold">{cards.length}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          </div>
          <span className="hidden text-xs text-text-2 sm:inline">
            {lang === "id" ? "Papan kebenaran":"Board of Truth" }
          </span>
          <span className="hidden text-xs text-text-2 sm:inline">
            - Please jangan aneh aneh 🥹
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-accent">
            {lang === "id" ? "Terima kasih atas masukanmu! ❤️" : "Thanks for posting! ❤️"}
          </span>

          <button
            type="button"
            onClick={handleShakeBoard}
            title={lang === "id" ? "Kocok Kartu" : "Shake Cards"}
            className="rounded-md border border-line bg-bg p-2 font-mono text-xs text-text transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            🔄
          </button>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="rounded-md border border-accent bg-accent/10 px-3 py-1.5 font-mono text-xs font-semibold text-accent transition-colors duration-150 hover:bg-accent hover:text-bg"
          >
            {lang === "id" ? "+ Tulis & Gambar Note" : "+ Draw & Post Note"}
          </button>

          <button
            type="button"
            onClick={handleClearCards}
            className="rounded-md border border-line bg-bg px-2 py-1.5 font-mono text-xs text-text-2 hover:border-red-400 hover:text-red-400"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Physics Canvas Area */}
      <div
        ref={containerRef}
        className="relative h-[480px] w-full overflow-hidden rounded-lg border border-line bg-bg"
      >
        <canvas ref={canvasRef} className="block h-full w-full cursor-grab active:cursor-grabbing" />

        <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex justify-between font-mono text-[11px] text-text-2/70">
          <span>{lang === "id" ? "⚡ Drag kartu doodle secara bebas" : "⚡ Drag polaroid cards around"}</span>
          <span>{lang === "id" ? "Klik = Baca & Perbesar Note 📖" : "Click = Read & Expand Note 📖"}</span>
        </div>
      </div>

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
                  <span>{lang === "id" ? "Kanvas Gambar Doodle 🎨" : "Doodle Drawing Canvas 🎨"}</span>
                  <button
                    type="button"
                    onClick={clearDrawingCanvas}
                    className="text-[11px] text-text-2 hover:text-red-400"
                  >
                    🗑 Clear
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