# TowerAI

TowerAI is the extracted reusable TrackerAI package from The Tower Run Tracker codebase.

It currently exposes two public entry points:

- `@tmrxjd/towerai`
- `@tmrxjd/towerai/core`
- `@tmrxjd/towerai/tools`

## Development

Requirements:

- Node.js 22
- pnpm 10.8.1

Install dependencies:

```bash
pnpm install
```

Build the package:

```bash
pnpm build
```

## Publishing

The package is configured to publish to GitHub Packages under the `@tmrxjd` scope.

## KB Artifacts

The shared TrackerAI knowledge bundle now publishes through this repository instead of Appwrite.

- Artifact manifest: `artifacts/kb/manifest.json`
- Versioned provider bundles: `artifacts/kb/<provider>/<version>/...`
- Cached `gte-small` model assets: `artifacts/models/gte-small/...`

Clone with Git LFS enabled before working with the tracked ONNX model payload:

```bash
git lfs install
git lfs pull
```

## License

This repository is licensed under BUSL-1.1. See the LICENSE file for the current terms.
