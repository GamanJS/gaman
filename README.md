<p align="right">
  <img src="https://github.com/7TogkID/gaman/blob/main/.github/images/indonesia.png?raw=true" width="23px">
</p>

<div align="center">
  <a href="https://gaman.7togk.id">
    <img src=".github/images/gaman_b.png" width="100%" >
  </a>
</div>

<p align="center">
  <p align="center">
  <strong>A lightweight, composable framework on Bun.</strong> 
  </br>
  <i>"Complexity doesn't have to be heavy.</i></br>
  <i>Built on <strong>Bun</strong>, designed for <strong>Logic</strong>, optimized for <strong>Scale</strong>."</i>
</p>

<p align="center">
  <a href="https://discord.gg/CQ6fEqBe8f">
    <img src="https://img.shields.io/discord/1410220109347160220?label=Discord&logo=Discord" alt="Disocrd">
  </a>
  <a href="https://www.npmjs.com/package/gaman">
    <img src="https://img.shields.io/npm/v/gaman" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/gaman">
    <img src="https://img.shields.io/npm/dm/gaman" alt="npm download">
  </a>
  <a href="https://github.com/gamanjs/gaman/pulse">
    <img src="https://img.shields.io/github/commit-activity/m/gamanjs/gaman" alt="Commit Activity">
  </a>
  <a href="https://github.com/gamanjs/gaman/commits/v2">
    <img src="https://img.shields.io/github/last-commit/gamanjs/gaman" alt="Commit Activity">
  </a>
  <a>
    <img src="https://img.shields.io/npm/l/gaman" alt="npm license">
  </a>
  <a>
    <img src="https://img.shields.io/github/stars/7togkid/gaman" alt="github stars">
  </a>
</p>

<hr/>

## The Lean Manifesto

- **Zero Magic:** All data flows are transparent (Logic-first).
- **Native Speed:** Maximizing Bun & Gaman Wire.
- **Opt-in Complexity** Go enterprise scale only when you need it.

## Create a New Project

GamanJS currently only supports Bun runtime.

```bash
bun create gaman@latest <name>
```

## GamanJS Project Structure 🏗️

GamanJS embraces the **Feature-Based Modularity** philosophy. This structure is designed to keep applications clean, easy to test, and scalable as your business expands.

### Enterprise Project Architecture
In a production scale or **Enterprise** project, the GamanJS folder structure will look like this:
```
src/
├── index.ts                 # The Orchestrator (Entry Point)
├── console/                 # Helper tool for adding custom commands
├── database/                # Database Configuration
│   ├── models/              # Global model and schema databases
│   ├── migrations/          # Database migration files
│   └── seeders/             # Database seeders files
└── modules/                 # Powerhouse of your Application
    ├── app/                 # Infrastructure Module (Global/Shared)
    │   ├── controllers/     # Handlers for Global Requests (Health, Index)
    │   │   └── AppController.ts
    │   ├── services/        # Shared Utilities & System Services
    │   │   └── AppService.ts
    │   └── AppRouter.ts     # Global Middleware & Base Routing
    │
    └── user/                # Feature Module (Example: User Management)
        ├── controllers/     # Request Handlers (Login, Register, Profile)
        │   └── UserController.ts
        ├── services/        # Business Logic (Auth Logic, User CRUD)
        │   └── UserService.ts
        ├── models/          # Data Access Layer (Powered by @gaman/db)
        │   └── UserModel.ts
        └── UserRouter.ts    # Scoped Routes & Feature Middleware
```

## Documentation

visit our [https://gaman.js.org/](https://gaman.js.org/)

## Star History

<a href="https://www.star-history.com/?repos=GamanJS%2Fgaman&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/image?repos=GamanJS/gaman&type=date&theme=dark&legend=bottom-right" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/image?repos=GamanJS/gaman&type=date&legend=bottom-right" />
   <img alt="Star History Chart" src="https://api.star-history.com/image?repos=GamanJS/gaman&type=date&legend=bottom-right" />
 </picture>
</a>

## All contributors ✨

<a href="https://github.com/GamanJS/gaman/graphs/contributors"><img width="720" src="https://contrib.rocks/image?repo=GamanJS/gaman" alt="A table of avatars from the project's contributors" /></a>
<a href="https://github.com/GamanJS/gamanjs.github.io/graphs/contributors"><img width="720" src="https://contrib.rocks/image?repo=GamanJS/gamanjs.github.io" alt="A table of avatars from the project's contributors" /></a>

## Contributing

**New Contributing welcome!** Check out our [Contributing Guide](CONTRIBUTING.md) for help getting started.

## Links

- [License (MIT)](https://github.com/7togkid/gaman/blob/main/LICENSE)
- [Official Website](https://gaman.7togk.id)
- [Discord](https://discord.gg/CQ6fEqBe8f)
- [WhatsApp Channel](https://whatsapp.com/channel/0029VbB0keR7z4kgczdSZ33s)
- [WhatsApp Group](https://chat.whatsapp.com/Dt759JIFWXf05RWJmWcbAM)
