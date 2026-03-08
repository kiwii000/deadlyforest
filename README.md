# Deadly Forest

A minimal playable browser survival game inspired by Don't Starve, built with **TypeScript + Phaser + Vite**.

## Run

```bash
npm install
npm run dev
```

Open the local URL from Vite (usually `http://localhost:5173`) and play immediately.

## Controls

- **WASD / Arrows**: Move
- **E**: Harvest nearest node (channel action)
- **C**: Quick-craft best available recipe
- **F**: Use/eat/place item from inventory slot 1
- **SPACE**: Attack nearby enemy
- **I**: Split stack in slot 1
- **P**: Pause scene

## Architecture

- `src/scenes`: MainMenu, Play, GameOver state flow
- `src/systems`: Inventory, Stats, Crafting, Time, Save, WorldGen
- `src/entities`: Player, Enemy, ResourceNode
- `src/data`: Item and recipe definitions (data-driven)
- `src/config`: Tunable constants
- `tests`: Lightweight system validations

## Notes

- Placeholder visuals use primitive shapes with semantic IDs/manifests to support future asset replacement.
- Save slots use browser localStorage.
