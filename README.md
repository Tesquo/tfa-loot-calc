# TFA Loot Calculator

A small [Laravel](https://laravel.com) + [Inertia](https://inertiajs.com) + [Vue](https://vuejs.org) app that works out the purple (unique) drop chance per raid in TFA.

## How it works

Given your team size, damage and deaths, the calculator derives:

- **Team purple odds** — a fixed rate per team size:

    | Team size | Odds      |
    | --------- | --------- |
    | 1         | 1 in 16   |
    | 2         | 1 in 16   |
    | 3         | 1 in 12.5 |
    | 4         | 1 in 10.5 |
    | 5         | 1 in 9.5  |
    | 6         | 1 in 8.5  |
    | 7         | 1 in 8    |
    | 8         | 1 in 7.5  |

- **Raid purple chance** — the chance a purple drops for the raid, reduced by team deaths:

    ```
    team purple odds − team deaths / (100 × team size)
    ```

- **Personal purple chance** — your share of that purple, scaled by damage contribution and reduced by your deaths:

    ```
    team purple odds × (your damage / total damage) − (team purple odds / team size) × 0.1 × your deaths
    ```

The unique drop table applies the raid's drop weights to your personal purple chance. Pet and Elite clues have a fixed drop rate.

## Requirements

- PHP 8.4+
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
