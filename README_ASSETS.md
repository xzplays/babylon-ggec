# Open model asset policy

This project runs without downloaded models. Put optional permissive `.glb` / `.gltf` replacements in:

- `public/assets/models/people/person.glb`
- `public/assets/models/vehicles/car.glb`, `bus.glb`, `truck.glb`, `van.glb`, `forklift.glb`
- `public/assets/models/city/` for future street lamps, trees, road furniture and modular buildings
- `public/assets/textures/` for CC0 pavement, asphalt and facade textures

All assets must also be listed in `src/assets/licenseRegistry.ts` and referenced by `src/assets/assetManifest.ts` before use. If a file is absent or fails to load, the scene keeps the procedural fallback people, vehicles and city modules.

## Allowed licenses

Use only CC0, MIT, Apache-2.0, BSD, or assets that explicitly allow commercial use, modification and redistribution. Do not use non-commercial, personal-use, login-only, ripped, unclear, or attribution-incompatible assets.

## Recommended sources

- Kenney assets: vehicles, roads, city props. Use only individual pages marked Creative Commons CC0.
- Quaternius assets: animated people, vehicles and city props. FAQ states CC0/free commercial use.
- Poly Haven: CC0 textures/HDRIs and some 3D assets.
- Khronos glTF Sample Assets: verify each model directory README/license before using; do not assume the entire repository has one license.

## Replacement workflow

1. Download a permissively licensed `.glb`/`.gltf`.
2. Save it to the matching folder under `public/assets/`.
3. Add or update a record in `src/assets/licenseRegistry.ts` with source, license URL, commercial-use flag and attribution requirement.
4. Point `src/assets/assetManifest.ts` at the local path.
5. Run `npm run build` and open the scene. The model should replace the fallback when available.
