# TFA Loot Calculator

A small [Laravel](https://laravel.com) + [Inertia](https://inertiajs.com) + [Vue](https://vuejs.org) app that works out the purple (unique) drop chance per raid in TFA.

## How it works

Given your team size, damage and deaths, the calculator derives:

- **Team purple odds** — `(1/14) × (1 + 0.04 × (team size − 2))`
- **Raid purple chance** — the chance a purple drops for the raid, reduced by team deaths:

    ```
    team purple odds − team deaths / (100 × team size)
    ```

- **Personal purple chance** — your share of that purple, scaled by damage contribution and reduced by your deaths:

    ```
    team purple odds × (your damage / total damage) − (team purple odds / team size) × 0.1 × your deaths
    ```

The unique drop table applies the raid's drop weights to your personal purple chance. Pet and Elite clue are fixed drop rates.

## Requirements

- PHP 8.3+
- [Composer](https://getcomposer.org)
- Node.js 20+

## Getting started

```bash
composer setup
composer run dev
```

Then visit http://localhost:8000.

## Deployment

A static build of the calculator is deployed to GitHub Pages on every push to
`main` via the `deploy-pages` workflow:

https://tesquo.github.io/tfa-loot-calc/
