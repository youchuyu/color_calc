type Lab = [number, number, number];
type RGB = [number, number, number];
declare class ColorCalc {
    constructor();
    delta_Eab2000(labA: Lab, labB: Lab): number;
    harmony(labA: Lab, labB: Lab): number;
    lab2rgb(lab: Lab): number[];
    rgb2lab(rgb: RGB): number[];
    hex2rgb(hex: string): number[];
    rgb2hex(rgb: RGB): string;
    getRandomColor(length: number): number[][];
    fitness(labA: Lab, labB: Lab, a: number): number;
    fitnessAll(entity: Lab[], factor: number): number;
    getDeltaAndHarmony(entity: Lab[]): {
        delta: number;
        harmony: number;
    };
    getSeqDelta(palette: Lab[]): {
        avg: number;
        SD: number;
    };
    h_sy(lab: Lab): number;
    chroma(a: number, b: number): number;
    hueAngle(a: number, b: number): number;
}
export default ColorCalc;
