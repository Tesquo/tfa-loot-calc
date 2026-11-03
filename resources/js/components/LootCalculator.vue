<script setup lang="ts">
import { computed, reactive } from 'vue';
import { calculate, greenlogTable, uniqueDrops } from '@/lib/loot';

const inputs = reactive({
    teamSize: 4,
    personalDamage: 5500,
    totalDamage: 37000,
    personalDeaths: 0,
    teamDeaths: 1,
});

const result = computed(() => calculate(inputs));
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

function formatDuration(minutes: number): string {
    const total = Math.round(minutes);
    const days = Math.floor(total / 1440);
    const hours = Math.floor((total % 1440) / 60);

    if (days > 0) return `${days}d ${hours}h`;

    const mins = total % 60;
    return `${hours}h ${mins}m`;
}
</script>

<template>
    <div class="min-h-screen">
        <div class="mx-auto max-w-3xl px-4 py-8 sm:py-12">
            <header class="mb-8 text-center">
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
                        <div class="field">
                            <label for="team-size" class="field__label"
                                >Team size</label
                            >
                            <select
                                id="team-size"
                                v-model="inputs.teamSize"
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

                        <div class="field">
                            <label for="personal-damage" class="field__label"
                                >Your damage</label
                            >
                            <input
                                id="personal-damage"
                                v-model.number="inputs.personalDamage"
                                type="number"
                                min="0"
                                class="field__input"
                            />
                        </div>

                        <div class="field">
                            <label for="total-damage" class="field__label"
                                >Total team damage</label
                            >
                            <input
                                id="total-damage"
                                v-model.number="inputs.totalDamage"
                                type="number"
                                min="0"
                                class="field__input"
                            />
                        </div>

                        <div class="field">
                            <label for="personal-deaths" class="field__label"
                                >Your deaths</label
                            >
                            <input
                                id="personal-deaths"
                                v-model.number="inputs.personalDeaths"
                                type="number"
                                min="0"
                                step="1"
                                class="field__input"
                            />
                        </div>

                        <div class="field">
                            <label for="team-deaths" class="field__label"
                                >Team deaths</label
                            >
                            <input
                                id="team-deaths"
                                v-model.number="inputs.teamDeaths"
                                type="number"
                                min="0"
                                step="1"
                                class="field__input"
                            />
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
                                {{ formatPercent(result.contribution) }}
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
                            <th>Raids to greenlog</th>
                            <th>Time to greenlog</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in greenlogRows" :key="row.teamSize">
                            <td>{{ row.teamSize }}</td>
                            <td>{{ formatContribution(row.contribution) }}</td>
                            <td>{{ formatInteger(row.raids) }}</td>
                            <td>{{ formatDuration(row.minutes) }}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="mt-2 text-xs text-ink-soft">
                    Greenlog = all five uniques. Assumes average (equal)
                    contribution and deathless raids. Raids and time are the 3σ
                    (99.7%) estimates at 19 minutes per raid.
                </p>
            </section>
        </div>
    </div>
</template>
