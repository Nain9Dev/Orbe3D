# Orbe Runner 3D

[![English](https://img.shields.io/badge/Language-English-blue?style=flat-square)](README.md)
[![Español](https://img.shields.io/badge/Idioma-Espa%C3%B1ol-emerald?style=flat-square)](README.es.md)
[![Jugar Online](https://img.shields.io/badge/Demo-orbe.naindev.com-0284c7?style=flat-square)](https://orbe.naindev.com)
[![CI](https://github.com/Nain9Dev/orbe-runner-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nain9Dev/orbe-runner-3d/actions/workflows/deploy.yml)
[![Ecosystem Status](https://img.shields.io/badge/status-100%25%20operational-success)](https://status.naindev.com)
[![Engineering Handbook](https://img.shields.io/badge/paved%20road-Pure%20Math%20ECS-blue)](https://github.com/Nain9Dev/engineering-handbook)
[![Cost](https://img.shields.io/badge/cost-0.00_%E2%82%AC-22c55e)](https://github.com/Nain9Dev/engineering-handbook/blob/main/governance/zero-cost-philosophy.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-informational)](LICENSE)

**Jugar online: https://orbe.naindev.com**

Un runner 3D arcade hecho desde cero. Eres **Lúmen**, la última chispa de luz de un universo que el Vacío ya se ha comido. Cruzas un **Ciclo** tras otro recuperando **Fragmentos de Estrella**, esquivando **Sombras** y sobreviviendo con tres capas de Núcleo.

Cada Ciclo se compone solo, pero no al azar: se ensambla a partir de piezas escritas a mano, y hay una garantía matemática de que **todo salto de la ruta es posible**.

- **Sin motor de juego.** Física, IA, cámara, generación de niveles, HUD y audio son código propio. La única dependencia es Three.js para dibujar.
- **Sin assets.** Modelos, texturas, música y efectos se generan en tiempo de ejecución. Cero bytes de imágenes o MP3.
- **Sin backend.** Archivos estáticos servidos desde un CDN. Un clic y estás jugando.
- **Open source, 0 € de coste.** MIT, herramientas libres de principio a fin.

![vista previa](preview.png)

---

## Jugar

| Tecla | Acción |
| :--- | :--- |
| `W A S D` / flechas | Moverse, relativo a la cámara |
| `Espacio` | Saltar — mantén pulsado para saltar más alto |
| `Shift` | **Impulso**: atraviesas el espacio, nada puede tocarte, y las Sombras frágiles se fracturan |
| Ratón | Cámara |
| `Esc` | Pausa |

En móvil: joystick analógico a la izquierda, cámara a la derecha, y botones de salto e Impulso. Un toque rápido en la zona derecha también salta.

### Las dos reglas que hay que aprender

- **Las Sombras y el plasma se cobran el Núcleo.** Eso es lo que esquivas.
- **El Vacío se cobra la Resonancia.** Caerte te devuelve a la última Baliza y te borra la racha, pero no te cuesta una vida.

El resto está en el **Registro**, dentro del propio juego.

---

## Desarrollo

Requiere Node 18 o superior.

```bash
git clone https://github.com/Nain9Dev/orbe-runner-3d.git
cd orbe-runner-3d
npm install
npm run dev
```

| Comando | Qué hace |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente (`http://127.0.0.1:5310`) |
| `npm run typecheck` | Verificación estricta de tipos TypeScript (`tsc --noEmit`) |
| `npm test` | Suite de 201 pruebas unitarias y de integración (Vitest) |
| `npm run build` | Compila el bundle de producción a `dist/` |
| `npm run check` | Puerta de calidad completa: `typecheck` + `test` + `build` |
| `npm run preview` | Previsualiza el build de producción (`http://127.0.0.1:5311`) |

**Stack**: TypeScript · Vite · Three.js · Web Audio API · DOM plano para la interfaz.
Está fijado en [`AGENTS.md`](AGENTS.md) y no se cambia sin un ADR aprobado.

---

## Cómo está montado

Un **ECS** (Entity–Component–System) de unas 200 líneas, y cuatro capas con una regla de dependencia estricta.

```
src/
├── main.ts               # monta el mundo y enchufa los sistemas: esto ES el juego
├── config.ts             # todos los números ajustables del "feel"
├── core/                 # motor genérico: no sabe qué es un orbe
│   ├── world.ts          #   ECS: entidades, consultas, registro de sistemas
│   ├── engine.ts         #   bucle de paso fijo (lógica) + dibujado por frame
│   ├── events.ts         #   bus de eventos
│   └── input.ts          #   teclado, ratón y táctil como estado consultable
├── domain/               # matemática pura, sin importar NADA
│   ├── jump-arc.ts       #   hasta dónde llega un salto → alcanzabilidad de niveles
│   └── integrity.ts      #   invariantes de la vida del jugador
├── game/                 # contenido
│   ├── chunks.ts         #   biblioteca de piezas de nivel escritas a mano
│   ├── composer.ts       #   Ciclo → plano verificable (datos puros)
│   ├── level.ts          #   plano → entidades
│   ├── prefabs.ts        #   catálogo de objetos
│   └── models.ts         #   modelos procedurales
├── systems/              # lógica
│   ├── player.ts         #   intención → velocidad
│   ├── physics.ts        #   velocidad → posición + colisiones
│   ├── enemy.ts          #   máquinas de estado de cada arquetipo
│   ├── projectile.ts     #   proyectiles
│   ├── triggers.ts       #   contactos → eventos de juego
│   ├── game.ts           #   las reglas: Fragmentos, Núcleo, Ciclos
│   ├── camera.ts, render.ts, audio.ts, particles.ts, avatar.ts, powerups.ts
│   └── hud.ts            #   enlace mundo → interfaz, y nada más
└── ui/                   # presentación: sólo DOM, cero conocimiento del juego
    ├── health.ts         #   Integridad del Núcleo
    ├── widgets.ts        #   Impulso, Resonancia, progreso, avisos
    ├── screen.ts         #   viñetas a pantalla completa
    └── menu.ts           #   menús, ajustes, Registro
```

Cada frame:
```
entrada → sistemas de lógica (paso fijo 1/60) → eventos → dibujado
```
El paso fijo hace que la física se comporte igual a 30 que a 144 FPS.

---

## Licencia

MIT — ver [`LICENSE`](LICENSE). Usa [Three.js](https://threejs.org) (MIT) como única dependencia de ejecución.
