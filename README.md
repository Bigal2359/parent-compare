# Parent Compare

A browser-based tool that uses AI face recognition to determine which parent a baby looks more like.

## How it works

Upload three photos — a baby and two parents — and the app computes a facial similarity score for each parent using Euclidean distance between face descriptors. The closer match is highlighted in green.

All processing happens entirely in the browser using [face-api.js](https://github.com/justadudewhohacks/face-api.js), a TensorFlow.js-based face recognition library. No images are uploaded to any server.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build optimized production output to `dist/` |
| `npm run preview` | Serve the production build locally |

## Tech stack

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) — face detection and recognition
- [Vite](https://vitejs.dev) — build tool and dev server
- Vanilla HTML / CSS / JavaScript
