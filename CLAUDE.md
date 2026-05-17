# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Balatro clone — a poker-based roguelike card game built with Create React App (react-scripts 5) and React 19. Targets deployment to GitHub Pages at `https://TrinhDuc01.github.io/balatro-clone-web` (`homepage` field in package.json).

## Commands

- `npm start` — dev server at http://localhost:3000
- `npm test` — Jest in watch mode (react-scripts). Run a single file: `npm test -- src/App.test.js`. Run once (CI-style): `CI=true npm test`.
- `npm run build` — production bundle to `build/`
- `npm run deploy` — runs `predeploy` (build) then publishes `build/` to the `gh-pages` branch

There is no lint script in package.json. ESLint runs implicitly via `react-scripts start`/`build` using the `react-app` + `react-app/jest` configs.

## Architecture

### Single-page app, Redux-driven game loop

`src/index.js` mounts `<App>` inside a Redux `<Provider>` (`src/Redux/store.js` uses classic `createStore`, not Redux Toolkit). `App.js` initializes the deck on mount with `dispatch({ type: 'InitDeckRoot', payload: Deck() })`, then immediately draws 8 cards. It also re-draws whenever `gameWin` flips back to `false` (i.e. on Next Stage).

### Redux store shape

The root reducer (`src/Redux/reducers/index.js`) combines seven slices that together hold all game state. Each slice has its own action types — there is no central action-types file, action strings are typed inline at every `dispatch` call.

- `DrawCardReducer` — `DeckAllGame` (full 52-card deck), `remainingCards` (deck minus drawn), `drawCard` (cards in hand). Owns shuffling (`Draw` action), sorting (`SortRank`, `SortSuit`), and reordering via drag (`ChangIndex`).
- `PlayedCardReducer` — array of currently-selected cards (max 5). Selected via `AddCard`/`RemoveCard` from `Card.js`.
- `HandsDiscardsReducer` — `hands: 4`, `discards: 4`, `gameOver`, `gameWin` flags. `RestoreHandsDiscards` resets back to defaults.
- `PokerHandReducer` — `PokerHandPlay` (current hand rank object), `CardScore` (cards that count toward the rank). Recomputed on every `CheckHand` dispatch via `handRanking()`.
- `RoundScoreReducer` — `roundScore`, `isCalculate` flag toggled around the play-hand animation.
- `ChipXMultReducer` — running `chip`/`mult` totals built up during the play animation.
- `ChallangeBlindReducer` — current blind name + required score. `UpdateBlind` bumps `blindValue` by +100.
- `AnteReducer.js` exists but is not wired into `combineReducers`.

### Hand evaluation

`src/Class/PlayCard.js` defines `PlayCard` with `rank`, `suit`, `position` (sprite-sheet offset), and helpers like `getRank()`, `getSuit()`, `points()`. The constructor uses a module-level `lastPlayCardId` counter so every card across the app has a globally-unique numeric `id` used everywhere for equality/key checks.

`src/Class/HandRankingOption.js` is the rules engine:
- `handRankingOption` is the table of every possible hand (Pair → Royal Flush) with chip/mult getters that scale with `level`. The `level`/`timesPlayed` fields are mutable — `PokerHandReducer`'s default state references this object directly, so leveling up a hand mutates the shared table.
- `handRanking(hand)` classifies a played hand and returns `{ rank, usedCards }`. `usedCards` is only the cards that actually score (e.g. just the pair from a Pair), and `CardScore` in the reducer holds those.
- `HandMax = 5` controls when Flush/Straight are allowed (must play exactly 5 cards).

### Play-hand animation flow

`Components/MainGame/ButtonFunction/ButtonFunction.js` `handlePlayHand` is the most intricate piece of code in the app. It dispatches a sequence of actions interleaved with `setTimeout` and `await new Promise(setTimeout)` to drive a per-card chip-accumulation animation: queries DOM nodes by class (`.chip-blue`, `.score-chip`), adds/removes `bounce` class, and plays sounds via `useRef`-held `<audio>` elements. Timing constants (300ms between cards, 600ms before redraw, 1000ms before reset) are intentionally interlocked — changing one can desync the UI from state.

`InfoRound.js` is what decides game-over / game-win: a `useEffect` on `[hands, roundScore]` flips `GameOver` if hands hit 0 below the blind, and `GameWin` if the round score meets the blind.

### Components

- `Components/Card/Card.js` — single card view. Renders the sprite-sheet face by setting `backgroundPosition` from `infoCard.position`; the back is a separate webp. Handles 3D tilt on `mousemove`, click-to-select, drag-and-drop reordering, and plays card1.ogg / card3.ogg on select/deselect. Click is disabled via `disableOnClick` prop.
- `Components/Deck/Deck.js` — builds a fresh 52-card deck. Note the suit name `'Spread'` is used in place of `'Spade'` throughout the codebase (`getSuit()`, CSS classes, asset filenames); do not rename without grepping.
- `Components/MainGame/Combine/Combine.js` — top-level layout combining sidebar + playing area.
- `Components/MainGame/CardDraw/CardDraw.js` — owns the hand row; staggers card appearance via a `visibleCount` interval, computes the fanned `rotateZ` for each card, and handles drag-drop reordering (dispatches `ChangIndex`).
- `Components/BackgroundHome/BackgroundHomeCanvas.js` — animated background using `glsl-canvas-js` with the fragment shader in `ShaderHomeBackground.js`.

### Asset paths

All static asset URLs (images in `public/assets/`, sounds in `public/Sounds/`) must be prefixed with `${process.env.PUBLIC_URL}/...` because the app is served from a subpath (`/balatro-clone-web/`) on GitHub Pages. Hard-coded `/assets/...` paths will 404 in production. A few existing `<audio src='./Sounds/...'>` tags in GameOver/GameWin are exceptions that happen to work because of relative resolution.

### Notes on style

- Source comments are in Vietnamese. Keep that language when extending nearby comments; the rest of the codebase (identifiers, strings) is English.
- Code uses pre-Redux-Toolkit patterns: string action types, switch reducers, classic `createStore`. Match this style rather than introducing slices/`createSlice`.
- The repo has both `Balatro-clone/` and `balatro-clone/` directories at the same parent — they appear to be duplicate copies. Confirm with the user which is authoritative before editing the other.
