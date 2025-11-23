"use client";

import { useEffect, useRef } from "react";

const TILE = 16;
const SCALE = 3;

const level = [
  "....................................................................................................",
  "....................................................................................................",
  "....................................................................................................",
  "...................2222.............................................................................",
  ".............................................2222...................................................",
  "....................................................................................................",
  ".............2222.................................................2222...............................",
  "....................................................................................................",
  "#############################..###########################..#############################",
  "#############################..###########################..#############################",
];

const ENEMIES = [
  { x: 300, y: 120, dir: -1 },
  { x: 400, y: 120, dir: -1 },
  { x: 550, y: 120, dir: -1 },
  { x: 700, y: 120, dir: -1 },
  { x: 800, y: 120, dir: -1 },
  { x: 950, y: 120, dir: -1 },
  { x: 1100, y: 120, dir: -1 },
  { x: 1200, y: 120, dir: -1 },
  { x: 1350, y: 120, dir: -1 },
];

export default function Game() {
  const canvasRef = useRef(null);

  // 🔥 teclas con useRef → NO reinician el juego
  const keys = useRef({
    left: false,
    right: false,
    jump: false,
  });

  function setKey(code, pressed) {
    keys.current[code] = pressed;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const viewWidth = 256;
    const viewHeight = 240;

    canvas.width = viewWidth * SCALE;
    canvas.height = viewHeight * SCALE;

    ctx.scale(SCALE, SCALE);

    const player = {
      x: 50,
      y: 50,
      w: 14,
      h: 14,
      velX: 0,
      velY: 0,
      speed: 1.4,
      jump: -7,
      grounded: false,
    };

    const gravity = 0.35;
    const friction = 0.85;

    let cameraX = 0;

    function isSolid(tile) {
      return tile === "#" || tile === "2";
    }

    function getTile(x, y) {
      const tx = Math.floor(x / TILE);
      const ty = Math.floor(y / TILE);

      if (ty < 0 || ty >= level.length) return ".";
      if (tx < 0 || tx >= level[ty].length) return "#";

      return level[ty][tx];
    }

    function rectVsLevel(x, y, w, h) {
      return (
        isSolid(getTile(x, y)) ||
        isSolid(getTile(x + w, y)) ||
        isSolid(getTile(x, y + h)) ||
        isSolid(getTile(x + w, y + h))
      );
    }

    function update() {
      // controles correctos
      if (keys.current.left) player.velX = -player.speed;
      else if (keys.current.right) player.velX = player.speed;
      else player.velX = 0;

      if (keys.current.jump && player.grounded) {
        player.velY = player.jump;
        player.grounded = false;
      }

      player.velY += gravity;
      player.velX *= friction;

      player.x += player.velX;
      if (rectVsLevel(player.x, player.y, player.w, player.h)) {
        player.x -= player.velX;
        player.velX = 0;
      }

      player.y += player.velY;
      if (rectVsLevel(player.x, player.y, player.w, player.h)) {
        player.y -= player.velY;
        if (player.velY > 0) player.grounded = true;
        player.velY = 0;
      }

      if (player.x > cameraX + 100) cameraX = player.x - 100;

      ENEMIES.forEach((e) => {
        e.x += 0.4 * e.dir;
        if (rectVsLevel(e.x, e.y, 14, 14)) e.dir *= -1;

        if (
          player.x < e.x + 14 &&
          player.x + player.w > e.x &&
          player.y < e.y + 14 &&
          player.y + player.h > e.y
        ) {
          if (player.velY > 0) {
            e.x = -1000;
            player.velY = player.jump / 1.5;
          } else {
            player.x = 50;
            player.y = 50;
          }
        }
      });
    }

    function draw() {
      ctx.clearRect(0, 0, viewWidth, viewHeight);

      level.forEach((row, y) => {
        [...row].forEach((tile, x) => {
          if (tile === "#") ctx.fillStyle = "#7c3f00";
          else if (tile === "2") ctx.fillStyle = "#b5651d";
          else return;

          ctx.fillRect(x * TILE - cameraX, y * TILE, TILE, TILE);
        });
      });

      ctx.fillStyle = "#ff0000";
      ctx.fillRect(player.x - cameraX, player.y, player.w, player.h);

      ctx.fillStyle = "#5a0000";
      ENEMIES.forEach((e) => {
        ctx.fillRect(e.x - cameraX, e.y, 14, 14);
      });
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    loop();

    // teclado físico
    window.addEventListener("keydown", (e) => {
      if (e.code === "ArrowLeft") setKey("left", true);
      if (e.code === "ArrowRight") setKey("right", true);
      if (e.code === "Space") setKey("jump", true);
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "ArrowLeft") setKey("left", false);
      if (e.code === "ArrowRight") setKey("right", false);
      if (e.code === "Space") setKey("jump", false);
    });
  }, []);

  return (
    <>
      <canvas ref={canvasRef} />

      {/* BOTONES IZQUIERDA/DERECHA */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          display: "flex",
          gap: "20px",
          userSelect: "none",
        }}
      >
        <button
          onTouchStart={() => setKey("left", true)}
          onTouchEnd={() => setKey("left", false)}
          style={btnStyle}
        >
          ⬅️
        </button>

        <button
          onTouchStart={() => setKey("right", true)}
          onTouchEnd={() => setKey("right", false)}
          style={btnStyle}
        >
          ➡️
        </button>
      </div>

      {/* BOTÓN DE SALTO A LA DERECHA */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          userSelect: "none",
        }}
      >
        <button
          onTouchStart={() => setKey("jump", true)}
          onTouchEnd={() => setKey("jump", false)}
          style={btnStyle}
        >
          ⬆️
        </button>
      </div>
    </>
  );
}

const btnStyle = {
  width: 60,
  height: 60,
  fontSize: 30,
  borderRadius: "50%",
  border: "2px solid black",
  background: "#fff",
  opacity: 0.8,
};
