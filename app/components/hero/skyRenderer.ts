/*
 * SKY RENDERER — the sky over Goddard, drawn the way it is lit: sunlight
 * scattered by the air (Rayleigh) and by haze (Mie), integrated along each
 * view ray in a fragment shader. The scattering integral follows Rye
 * Terrell's glsl-atmosphere (public domain, The Unlicense), with the
 * Earth's shadow added so the sky goes dark after sunset.
 *
 * The view is a wide strip of sky: the horizon at a fixed height, the
 * zenith at the top edge, the sun at a fixed place across. Only the sun's
 * elevation changes the picture, so it is drawn once per change, not per frame.
 */

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uHorizon;
uniform float uFovH;
uniform float uSunEl;
uniform float uSunAz;
uniform float uStars;

const float PI = 3.141592653589793;
const int I_STEPS = 16;
const int J_STEPS = 8;
const float R_PLANET = 6371e3;
const float R_ATMOS = 6471e3;
const vec3 K_RLH = vec3(5.5e-6, 13.0e-6, 22.4e-6);
const float K_MIE = 21e-6;
const float SH_RLH = 8e3;
const float SH_MIE = 1.2e3;
const float G = 0.758;
const float I_SUN = 22.0;
const float EXPOSURE = 1.45;

vec2 rsi(vec3 r0, vec3 rd, float sr) {
  float a = dot(rd, rd);
  float b = 2.0 * dot(rd, r0);
  float c = dot(r0, r0) - sr * sr;
  float d = b * b - 4.0 * a * c;
  if (d < 0.0) return vec2(1e5, -1e5);
  return vec2((-b - sqrt(d)) / (2.0 * a), (-b + sqrt(d)) / (2.0 * a));
}

vec3 atmosphere(vec3 r, vec3 r0, vec3 pSun) {
  vec2 p = rsi(r0, r, R_ATMOS);
  if (p.x > p.y) return vec3(0.0);
  p.y = min(p.y, rsi(r0, r, R_PLANET).x);
  float iStep = (p.y - p.x) / float(I_STEPS);
  float iTime = 0.0;
  vec3 totalRlh = vec3(0.0);
  vec3 totalMie = vec3(0.0);
  float iOdRlh = 0.0;
  float iOdMie = 0.0;
  float mu = dot(r, pSun);
  float mumu = mu * mu;
  float gg = G * G;
  float pRlh = 3.0 / (16.0 * PI) * (1.0 + mumu);
  float pMie = 3.0 / (8.0 * PI) * ((1.0 - gg) * (mumu + 1.0)) / (pow(1.0 + gg - 2.0 * mu * G, 1.5) * (2.0 + gg));
  for (int i = 0; i < I_STEPS; i++) {
    vec3 iPos = r0 + r * (iTime + iStep * 0.5);
    float iHeight = length(iPos) - R_PLANET;
    float odRlh = exp(-iHeight / SH_RLH) * iStep;
    float odMie = exp(-iHeight / SH_MIE) * iStep;
    iOdRlh += odRlh;
    iOdMie += odMie;
    iTime += iStep;
    /* the Earth's shadow: no direct sunlight reaches this point */
    vec2 shadow = rsi(iPos, pSun, R_PLANET);
    if (shadow.x > 0.0 && shadow.x <= shadow.y) continue;
    float jStep = rsi(iPos, pSun, R_ATMOS).y / float(J_STEPS);
    float jTime = 0.0;
    float jOdRlh = 0.0;
    float jOdMie = 0.0;
    for (int j = 0; j < J_STEPS; j++) {
      vec3 jPos = iPos + pSun * (jTime + jStep * 0.5);
      float jHeight = length(jPos) - R_PLANET;
      jOdRlh += exp(-jHeight / SH_RLH) * jStep;
      jOdMie += exp(-jHeight / SH_MIE) * jStep;
      jTime += jStep;
    }
    vec3 attn = exp(-(K_MIE * (iOdMie + jOdMie) + K_RLH * (iOdRlh + jOdRlh)));
    totalRlh += odRlh * attn;
    totalMie += odMie * attn;
  }
  return I_SUN * (pRlh * K_RLH * totalRlh + pMie * K_MIE * totalMie);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 viewDir(float el, float az) {
  return vec3(cos(el) * sin(az), sin(el), cos(el) * cos(az));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float el = (uv.y - uHorizon) / (1.0 - uHorizon) * (PI * 0.5);
  float az = (uv.x - 0.5) * uFovH;
  vec3 sun = viewDir(uSunEl, uSunAz);
  vec3 eye = vec3(0.0, R_PLANET + 1e3, 0.0);

  if (el < 0.0) {
    /* the ground: near black, lit faintly by the sky just above it */
    vec3 glow = 1.0 - exp(-EXPOSURE * atmosphere(viewDir(0.02, az), eye, sun));
    gl_FragColor = vec4(vec3(0.02, 0.021, 0.024) + 0.07 * glow, 1.0);
    return;
  }

  vec3 dir = viewDir(el, az);
  vec3 c = atmosphere(dir, eye, sun);
  /* the sun's disc, larger than life so it reads at this scale, and round
     on the screen rather than on the sphere */
  float d = length(vec2(az - uSunAz, el - uSunEl));
  c += smoothstep(0.032, 0.024, d) * vec3(24.0, 21.0, 15.0);
  c = 1.0 - exp(-EXPOSURE * c);
  /* night: a deep blue floor and a scatter of faint stars */
  c = max(c, vec3(0.012, 0.017, 0.034));
  c += uStars * step(0.9985, hash(floor(gl_FragCoord.xy))) * 0.55 * smoothstep(0.0, 0.25, el);
  gl_FragColor = vec4(c, 1.0);
}
`;

export interface SkyView {
  /* fraction of the height, from the bottom, where the ground ends */
  horizon: number;
  /* where across the width the sun stands, 0–1 */
  sunX: number;
  /* the sun's elevation in degrees */
  sunElevation: number;
}

export interface SkyRenderer {
  render(view: SkyView): void;
  /* match the backing store to the canvas's box; the caller draws after */
  resize(): void;
  dispose(): void;
}

/* backing pixels per CSS pixel: the sky is soft, so half resolution is plenty */
const SCALE = 0.5;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

interface Program {
  program: WebGLProgram;
  shaders: WebGLShader[];
  quad: WebGLBuffer | null;
  uniforms: Record<"res" | "horizon" | "fovH" | "sunEl" | "sunAz" | "stars", WebGLUniformLocation | null>;
}

function release(gl: WebGLRenderingContext, program: WebGLProgram | null, shaders: (WebGLShader | null)[]): void {
  for (const shader of shaders) if (shader) gl.deleteShader(shader);
  if (program) gl.deleteProgram(program);
}

/* compile and link the sky, or null (everything made so far is released) */
function build(gl: WebGLRenderingContext): Program | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) {
    release(gl, program, [vs, fs]);
    return null;
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    release(gl, program, [vs, fs]);
    return null;
  }
  gl.useProgram(program);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  return {
    program,
    shaders: [vs, fs],
    quad,
    uniforms: { res: u("uRes"), horizon: u("uHorizon"), fovH: u("uFovH"), sunEl: u("uSunEl"), sunAz: u("uSunAz"), stars: u("uStars") },
  };
}

/* the planet-sized ray maths needs real 32-bit floats in the fragment shader */
function hasHighp(gl: WebGLRenderingContext): boolean {
  const format = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  return !!format && format.precision >= 23;
}

/* Null when WebGL (or a highp fragment shader) is unavailable; the hero then
   keeps its flat sky colour. If the browser takes the context away (iOS does,
   in background tabs) the sky is rebuilt when it comes back and `onRestore`
   asks for a fresh frame. */
export function createSkyRenderer(canvas: HTMLCanvasElement, onRestore: () => void): SkyRenderer | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: true });
  if (!gl || !hasHighp(gl)) return null;
  let sky = build(gl);
  if (!sky) return null;

  const onLost = (e: Event) => {
    e.preventDefault();
    sky = null;
  };
  const onRestored = () => {
    sky = build(gl);
    if (sky) onRestore();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * SCALE));
    const height = Math.max(1, Math.round(rect.height * SCALE));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  const render = (view: SkyView) => {
    if (!sky || gl.isContextLost()) return;
    const { uniforms } = sky;
    const { width, height } = canvas;
    const skyHeight = height * (1 - view.horizon);
    /* square degrees: as many degrees across a pixel as up it */
    const fovH = (width / Math.max(1, skyHeight)) * (Math.PI / 2);
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.res, width, height);
    gl.uniform1f(uniforms.horizon, view.horizon);
    gl.uniform1f(uniforms.fovH, fovH);
    gl.uniform1f(uniforms.sunEl, (view.sunElevation * Math.PI) / 180);
    gl.uniform1f(uniforms.sunAz, (view.sunX - 0.5) * fovH);
    gl.uniform1f(uniforms.stars, Math.min(1, Math.max(0, (-view.sunElevation - 6) / 8)));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  return {
    render,
    resize,
    dispose: () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (!sky) return;
      release(gl, sky.program, sky.shaders);
      gl.deleteBuffer(sky.quad);
    },
  };
}
