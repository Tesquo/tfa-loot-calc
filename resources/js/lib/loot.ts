export interface LootInputs {
    teamSize: number;
    personalDamage: number;
    totalDamage: number;
    personalDeaths: number;
    teamDeaths: number;
}

export interface LootResult {
    teamPurpleOdds: number;
    raidPurpleChance: number;
    contribution: number;
    personalPurpleChance: number;
}

export interface UniqueDrop {
    name: string;
    chance: number;
    fixed: boolean;
}

const MIN_TEAM_SIZE = 2;
const MAX_TEAM_SIZE = 8;

const PURPLE_UNIQUES = [
    { name: 'Rondache', weight: 1 / 3 },
    { name: "Zorya's tome", weight: 1 / 3.75 },
    { name: 'Horn of Bran', weight: 1 / 5 },
    { name: 'Ascension crossbows', weight: 1 / 7.5 },
    { name: 'Obligator', weight: 1 / 15 },
] as const;

const PET_CHANCE = 1 / 750;
const ELITE_CLUE_CHANCE = 1 / 10;

function toNumber(value: number): number {
    return Number.isFinite(value) ? value : 0;
}

function clampTeamSize(teamSize: number): number {
    return Math.min(
        MAX_TEAM_SIZE,
        Math.max(MIN_TEAM_SIZE, Math.round(teamSize)),
    );
}

export function teamPurpleOdds(teamSize: number): number {
    return (1 / 14) * (1 + 0.04 * (teamSize - 2));
}

export function calculate(inputs: LootInputs): LootResult {
    const teamSize = clampTeamSize(toNumber(inputs.teamSize));
    const personalDamage = Math.max(0, toNumber(inputs.personalDamage));
    const totalDamage = Math.max(0, toNumber(inputs.totalDamage));
    const personalDeaths = Math.max(0, toNumber(inputs.personalDeaths));
    const teamDeaths = Math.max(0, toNumber(inputs.teamDeaths));

    const odds = teamPurpleOdds(teamSize);
    const contribution = totalDamage > 0 ? personalDamage / totalDamage : 0;
    const raidPurpleChance = Math.max(0, odds - teamDeaths / (100 * teamSize));
    const personalPurpleChance = Math.max(
        0,
        odds * contribution - (odds / teamSize) * 0.1 * personalDeaths,
    );

    return {
        teamPurpleOdds: odds,
        raidPurpleChance,
        contribution,
        personalPurpleChance,
    };
}

export function uniqueDrops(personalPurpleChance: number): UniqueDrop[] {
    const uniques = PURPLE_UNIQUES.map((drop) => ({
        name: drop.name,
        chance: personalPurpleChance * drop.weight,
        fixed: false,
    }));

    return [
        ...uniques,
        { name: 'Pet', chance: PET_CHANCE, fixed: true },
        { name: 'Elite clue', chance: ELITE_CLUE_CHANCE, fixed: true },
    ];
}

export interface GreenlogRow {
    teamSize: number;
    contribution: number;
    raids: number;
    minutes: number;
}

const RAID_MINUTES = 19;
const GREENLOG_SIGMAS = 3;

function greenlogMoments(purpleChance: number): {
    mean: number;
    standardDeviation: number;
} {
    const probabilities = PURPLE_UNIQUES.map(
        (drop) => purpleChance * drop.weight,
    );

    let mean = 0;
    let secondMoment = 0;

    const visitSubsets = (start: number, sum: number, count: number) => {
        if (count > 0) {
            const sign = count % 2 === 1 ? 1 : -1;

            mean += sign / sum;
            secondMoment += (sign * (2 - sum)) / (sum * sum);
        }

        for (let i = start; i < probabilities.length; i++) {
            visitSubsets(i + 1, sum + probabilities[i], count + 1);
        }
    };

    visitSubsets(0, 0, 0);

    const variance = Math.max(0, secondMoment - mean * mean);

    return {
        mean,
        standardDeviation: Math.sqrt(variance),
    };
}

export function greenlogTable(): GreenlogRow[] {
    const rows: GreenlogRow[] = [];

    for (let teamSize = MIN_TEAM_SIZE; teamSize <= MAX_TEAM_SIZE; teamSize++) {
        const contribution = 1 / teamSize;
        const purpleChance = teamPurpleOdds(teamSize) * contribution;
        const { mean, standardDeviation } = greenlogMoments(purpleChance);
        const raids = Math.round(mean + GREENLOG_SIGMAS * standardDeviation);

        rows.push({
            teamSize,
            contribution,
            raids,
            minutes: raids * RAID_MINUTES,
        });
    }

    return rows;
}
