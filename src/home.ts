class Random {
    _seed: number;

    constructor(seed: number) {
        this._seed = seed % 2147483647;
        if (this._seed <= 0) this._seed += 2147483646;
    }

    next() {
        return this._seed = this._seed * 16807 % 2147483647;
    };

    nextFloat() {
        return (this.next() - 1) / 2147483646;
    };
}

var canvas = document.getElementById("homeCanvas")! as HTMLCanvasElement;
var bg = document.getElementById("homeBg")!;
var ctx = canvas.getContext("2d")!;

var tmpCanvas = document.createElement("canvas");
var tmpCtx = tmpCanvas.getContext("2d")!;

const MAX_SIZE = 1024;
const NOISE_SCALE = 0.01/2;
const TAU = Math.PI * 2;
const SEED = 1699167263855;

var particles: number[][] = [];
var frameCount = 0;

var width: number, height: number;
function updateCanvasSize() {
    if (canvas.offsetWidth > canvas.offsetHeight) {
        width = Math.min(canvas.offsetWidth, MAX_SIZE);
        height = Math.floor(width * (canvas.offsetHeight / canvas.offsetWidth));
    }
    else {
        height = Math.min(canvas.offsetHeight, MAX_SIZE);
        width = Math.floor(height * (canvas.offsetWidth / canvas.offsetHeight));
    }
    canvas.width = width;
    canvas.height = height;
}

function point(x: number, y: number) {
    ctx.fillRect(x, y, 1, 1);
}

function draw() {
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    tmpCtx.globalAlpha = 0.9;
    tmpCtx.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tmpCanvas, 0, 0);
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (var p of particles) {
        point(p[0], p[1]);
        let n = noise(p[0] * NOISE_SCALE, p[1] * NOISE_SCALE, frameCount * NOISE_SCALE * NOISE_SCALE);
        let a = TAU * n;
        p[0] += Math.cos(a);
        p[1] += Math.sin(a);
        if (!onScreen(p)) {
            p[0] = rndInt(width);
            p[1] = rndInt(height);
        }
    }
}

function onScreen(v: number[]) {
    return v[0] >= 0 && v[0] <= width && v[1] >= 0 && v[1] <= height;
}

function renderLoop() {
    draw();
    ++frameCount;
    window.requestAnimationFrame(renderLoop);
}

var rng: Random;
function rndInt(max: number) {
    return Math.floor(rng.nextFloat() * max);
}

function init() {
    rng = new Random(SEED);
    noiseSeed(SEED);
    for (var i = 0; i < 100; ++i) {
        particles.push([
            rndInt(width),
            rndInt(height)
        ]);
    }

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    window.requestAnimationFrame(renderLoop);
}

///////////////////////////////////////////////////
// math/noise.js - p5.js
///////////////////////////////////////////////////
const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;

let perlin_octaves = 4; // default to medium smooth
let perlin_amp_falloff = 0.5; // 50% reduction/octave

const scaled_cosine = (i: number) => 0.5 * (1.0 - Math.cos(i * Math.PI));

let perlin: number[]; // will be initialized lazily by noise() or noiseSeed()

function noise(x: number, y = 0, z = 0) {
    if (perlin == null) {
        perlin = new Array(PERLIN_SIZE + 1);
        for (let i = 0; i < PERLIN_SIZE + 1; i++) {
            perlin[i] = Math.random();
        }
    }

    if (x < 0) {
        x = -x;
    }
    if (y < 0) {
        y = -y;
    }
    if (z < 0) {
        z = -z;
    }

    let xi = Math.floor(x),
        yi = Math.floor(y),
        zi = Math.floor(z);
    let xf = x - xi;
    let yf = y - yi;
    let zf = z - zi;
    let rxf, ryf;

    let r = 0;
    let ampl = 0.5;

    let n1, n2, n3;

    for (let o = 0; o < perlin_octaves; o++) {
        let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

        rxf = scaled_cosine(xf);
        ryf = scaled_cosine(yf);

        n1 = perlin[of & PERLIN_SIZE];
        n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
        n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
        n1 += ryf * (n2 - n1);

        of += PERLIN_ZWRAP;
        n2 = perlin[of & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
        n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
        n2 += ryf * (n3 - n2);

        n1 += scaled_cosine(zf) * (n2 - n1);

        r += n1 * ampl;
        ampl *= perlin_amp_falloff;
        xi <<= 1;
        xf *= 2;
        yi <<= 1;
        yf *= 2;
        zi <<= 1;
        zf *= 2;

        if (xf >= 1.0) {
            xi++;
            xf--;
        }
        if (yf >= 1.0) {
            yi++;
            yf--;
        }
        if (zf >= 1.0) {
            zi++;
            zf--;
        }
    }
    return r;
};

function noiseSeed(seed: number) {
    // Linear Congruential Generator
    // Variant of a Lehman Generator
    const lcg = (() => {
        // Set to values from http://en.wikipedia.org/wiki/Numerical_Recipes
        // m is basically chosen to be large (as it is the max period)
        // and for its relationships to a and c
        const m = 4294967296;
        // a - 1 should be divisible by m's prime factors
        const a = 1664525;
        // c and m should be co-prime
        const c = 1013904223;
        let seed: number, z: number;
        return {
            setSeed(val?: number) {
                // pick a random seed if val is undefined or null
                // the >>> 0 casts the seed to an unsigned 32-bit integer
                z = seed = (val == null ? Math.random() * m : val) >>> 0;
            },
            getSeed() {
                return seed;
            },
            rand() {
                // define the recurrence relationship
                z = (a * z + c) % m;
                // return a float in [0, 1)
                // if z = m then z / m = 0 therefore (z % m) / m < 1 always
                return z / m;
            }
        };
    })();

    lcg.setSeed(seed);
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
        perlin[i] = lcg.rand();
    }
};

/////////////////////////////////
init();