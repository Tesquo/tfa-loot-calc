<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { calculate, greenlogTable, uniqueDrops } from '@/lib/loot';
import heroImage from '../../images/hero.png';

const DEFAULT_TEAM_SIZE = 4;

const mode = ref<'simple' | 'advanced'>('simple');
const teamSize = ref(DEFAULT_TEAM_SIZE);
const percentage = ref(25);
const damages = ref<number[]>(defaultDamages(DEFAULT_TEAM_SIZE));
const deaths = ref<number[]>(defaultDeaths(DEFAULT_TEAM_SIZE));

function defaultDamages(size: number): number[] {
    return Array.from({ length: size }, () => 10000);
}

function defaultDeaths(size: number): number[] {
    return Array.from({ length: size }, () => 0);
}

function toFinite(value: number): number {
    return Number.isFinite(value) ? value : 0;
}

function resizePlayers(): void {
    const size = teamSize.value;
    const previousDamages = damages.value;
    const previousDeaths = deaths.value;

    damages.value = Array.from({ length: size }, (_, index) =>
        index < previousDamages.length ? previousDamages[index] : 10000,
    );
    deaths.value = Array.from({ length: size }, (_, index) =>
        index < previousDeaths.length ? previousDeaths[index] : 0,
    );
}

function switchMode(nextMode: 'simple' | 'advanced'): void {
    mode.value = nextMode;
    teamSize.value = DEFAULT_TEAM_SIZE;
    percentage.value = 25;
    damages.value = defaultDamages(DEFAULT_TEAM_SIZE);
    deaths.value = defaultDeaths(DEFAULT_TEAM_SIZE);
}

function playerLabel(index: number): string {
    return index === 1 ? 'You' : `Player ${index}`;
}

watch(teamSize, resizePlayers);

const result = computed(() => {
    if (mode.value === 'simple') {
        const contribution = Math.min(
            100,
            Math.max(0, toFinite(percentage.value)),
        );

        return calculate({
            teamSize: teamSize.value,
            personalDamage: contribution,
            totalDamage: 100,
            personalDeaths: 0,
            teamDeaths: 0,
        });
    }

    const totalDamage = damages.value.reduce(
        (sum, damage) => sum + toFinite(damage),
        0,
    );
    const totalDeaths = deaths.value.reduce(
        (sum, count) => sum + toFinite(count),
        0,
    );

    return calculate({
        teamSize: teamSize.value,
        personalDamage: damages.value[0],
        totalDamage,
        personalDeaths: deaths.value[0],
        teamDeaths: totalDeaths,
    });
});

const drops = computed(() => uniqueDrops(result.value.personalPurpleChance));
const greenlogRows = greenlogTable();

function formatPercent(chance: number): string {
    const percent = chance * 100;
    if (percent >= 10) return `${percent.toFixed(1)}%`;
    if (percent >= 1) return `${percent.toFixed(2)}%`;
    return `${percent.toFixed(3)}%`;
}

function formatOneInX(chance: number): string {
    if (chance <= 0) return '—';
    const x = 1 / chance;
    if (x >= 1000) return `1 in ${Math.round(x).toLocaleString()}`;
    if (x >= 100) return `1 in ${x.toFixed(1)}`;
    return `1 in ${x.toFixed(2)}`;
}

function formatContribution(fraction: number): string {
    const percent = fraction * 100;
    if (Number.isInteger(percent)) return `${percent}%`;
    if (Number.isInteger(percent * 10)) return `${percent.toFixed(1)}%`;
    return `${percent.toFixed(2)}%`;
}

function formatInteger(value: number): string {
    return Math.round(value).toLocaleString('en-US');
}
</script>

<template>
    <div class="min-h-screen">
        <div class="mx-auto max-w-3xl px-4 py-8 sm:py-12">
            <header class="mb-8 text-center">
                <img
                    :src="heroImage"
                    alt="TFA Loot Calculator"
                    class="mx-auto mb-4 h-auto w-full"
                />
                <h1
                    class="font-display text-3xl font-bold tracking-wide text-ink sm:text-4xl"
                >
                    TFA Loot Calculator
                </h1>
                <p class="mt-2 text-sm text-ink-soft">
                    Purple (unique) drop chance per raid
                </p>
            </header>

            <div class="grid gap-6 md:grid-cols-2">
                <section class="infobox">
                    <h2 class="infobox__header">Inputs</h2>
                    <div class="space-y-4 p-4">
                        <div class="flex border border-body-border">
                            <button
                                type="button"
                                class="flex-1 px-3 py-2 text-sm font-medium"
                                :class="
                                    mode === 'simple'
                                        ? 'bg-body-dark text-ink'
                                        : 'bg-body-main text-ink-soft'
                                "
                                @click="switchMode('simple')"
                            >
                                Simple
                            </button>
                            <button
                                type="button"
                                class="flex-1 border-l border-body-border px-3 py-2 text-sm font-medium"
                                :class="
                                    mode === 'advanced'
                                        ? 'bg-body-dark text-ink'
                                        : 'bg-body-main text-ink-soft'
                                "
                                @click="switchMode('advanced')"
                            >
                                Advanced
                            </button>
                        </div>

                        <div class="field">
                            <label for="team-size" class="field__label"
                                >Team size</label
                            >
                            <select
                                id="team-size"
                                v-model="teamSize"
                                autocomplete="off"
                                class="field__input"
                            >
                                <option
                                    v-for="n in 7"
                                    :key="n + 1"
                                    :value="n + 1"
                                >
                                    {{ n + 1 }}
                                </option>
                            </select>
                        </div>

                        <div v-if="mode === 'simple'" class="field">
                            <label for="percentage" class="field__label"
                                >Your percentage</label
                            >
                            <input
                                id="percentage"
                                v-model.number="percentage"
                                type="number"
                                min="0"
                                max="100"
                                autocomplete="off"
                                class="field__input"
                            />
                            <p class="text-xs text-ink-soft">
                                Your share of the raid, e.g. 25 for a 4-man.
                            </p>
                        </div>

                        <div v-else>
                            <table class="wikitable">
                                <thead>
                                    <tr>
                                        <th>Player</th>
                                        <th>Damage</th>
                                        <th>Deaths</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="index in teamSize" :key="index">
                                        <td class="whitespace-nowrap">
                                            {{ playerLabel(index) }}
                                        </td>
                                        <td>
                                            <input
                                                v-model.number="
                                                    damages[index - 1]
                                                "
                                                type="number"
                                                min="0"
                                                autocomplete="off"
                                                class="field__input"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                v-model.number="
                                                    deaths[index - 1]
                                                "
                                                type="number"
                                                min="0"
                                                step="1"
                                                autocomplete="off"
                                                class="field__input"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section class="infobox">
                    <h2 class="infobox__header">Results</h2>
                    <div class="space-y-5 p-4">
                        <div class="stat">
                            <div class="stat__label">Raid purple chance</div>
                            <div class="stat__value">
                                {{ formatPercent(result.raidPurpleChance) }}
                            </div>
                            <div class="stat__hint">
                                {{ formatOneInX(result.raidPurpleChance) }}
                            </div>
                        </div>

                        <div class="stat">
                            <div class="stat__label">
                                Personal purple chance
                            </div>
                            <div class="stat__value">
                                {{ formatPercent(result.personalPurpleChance) }}
                            </div>
                            <div class="stat__hint">
                                {{ formatOneInX(result.personalPurpleChance) }}
                            </div>
                        </div>

                        <div class="stat">
                            <div class="stat__label">Your contribution</div>
                            <div class="stat__value">
                                {{ formatContribution(result.contribution) }}
                            </div>
                        </div>

                        <div class="stat">
                            <div class="stat__label">Team purple odds</div>
                            <div class="stat__value">
                                {{ formatPercent(result.teamPurpleOdds) }}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section class="mt-8">
                <h2 class="mb-2 font-display text-lg font-bold text-ink">
                    Unique drops
                </h2>
                <table class="wikitable">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Chance</th>
                            <th>Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="drop in drops" :key="drop.name">
                            <td>{{ drop.name }}</td>
                            <td>{{ formatPercent(drop.chance) }}</td>
                            <td>
                                {{ formatOneInX(drop.chance) }}
                                <span v-if="drop.fixed" class="text-ink-soft"
                                    >(fixed)</span
                                >
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p class="mt-2 text-xs text-ink-soft">
                    Pet and Elite clue are fixed drop rates. The other uniques
                    scale from your personal purple chance using the raid's drop
                    weights.
                </p>
            </section>

            <section class="mt-8">
                <h2 class="mb-2 font-display text-lg font-bold text-ink">
                    Greenlog
                </h2>
                <table class="wikitable">
                    <thead>
                        <tr>
                            <th>Team size</th>
                            <th>Avg contribution</th>
                            <th>Expected raids to greenlog</th>
                            <th>3SD greenlog</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in greenlogRows" :key="row.teamSize">
                            <td>{{ row.teamSize }}</td>
                            <td>{{ formatContribution(row.contribution) }}</td>
                            <td>{{ formatInteger(row.expectedRaids) }}</td>
                            <td>{{ formatInteger(row.guaranteedRaids) }}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="mt-2 text-xs text-ink-soft">
                    Greenlog = all five uniques. Assumes average (equal)
                    contribution and deathless raids. Expected is the mean; 3SD
                    is the mean + 3 standard deviations (≈99.7%).
                </p>
            </section>
        </div>
    </div>
</template>
