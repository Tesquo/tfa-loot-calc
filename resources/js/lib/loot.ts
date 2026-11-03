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
    { name: 'Rondache', weight: 5 },
    { name: 'Tome', weight: 4 },
    { name: 'Zeal', weight: 5 },
    { name: 'Crossbows', weight: 4 },
    { name: 'Obligator', weight: 5 },
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
        chance: personalPurpleChance * (drop.weight / 15),
        fixed: false,
    }));

    return [
        ...uniques,
        { name: 'Pet', chance: PET_CHANCE, fixed: true },
        { name: 'Elite clue', chance: ELITE_CLUE_CHANCE, fixed: true },
    ];
}
