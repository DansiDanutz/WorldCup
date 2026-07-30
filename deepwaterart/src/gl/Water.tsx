import { useEffect, useRef } from "react";

/**
 * The sea, in a fragment shader.
 * Layered caustics + light shafts, falling away as you descend.
 * Raw WebGL — no three.js, no runtime dependency.
 */

const VERT = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform float u_depth;   // 0 at the surface, 1 in the abyss
uniform float u_quiet;   // 1 when motion is reduced

const vec3 SKY     = vec3(0.659, 0.796, 0.839);
const vec3 SHALLOW = vec3(0.173, 0.400, 0.502);
const vec3 SEA     = vec3(0.110, 0.337, 0.439);
const vec3 DEEP    = vec3(0.051, 0.165, 0.227);
const vec3 ABYSS   = vec3(0.027, 0.094, 0.125);
const vec3 EMBER   = vec3(0.816, 0.541, 0.369);

// Classic layered-distortion caustics.
float caustic(vec2 p, float t){
  vec2 i = p;
  float c = 1.0;
  const float inten = 0.0045;
  for (int n = 0; n < 4; n++){
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return clamp(pow(abs(c), 8.0), 0.0, 1.0);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float t = u_time * (u_quiet > 0.5 ? 0.06 : 0.35);

  // Vertical body of water, shifted by how far down the page you are.
  float y = clamp(uv.y - u_depth * 0.55, -0.4, 1.4);
  vec3 col = mix(DEEP, SEA, smoothstep(-0.1, 0.55, y));
  col = mix(col, SHALLOW, smoothstep(0.55, 0.92, y));
  col = mix(col, SKY, smoothstep(0.9, 1.15, y));
  col = mix(ABYSS, col, smoothstep(0.0, 0.35, y + 0.35));

  // Surface light, extinguishing with depth.
  float light = clamp(1.0 - u_depth * 1.75, 0.0, 1.0);

  // Caustics ride near the surface only.
  vec2 cp = vec2(uv.x * u_res.x / u_res.y, uv.y) * 6.0;
  float ca = caustic(cp, t + 8.0);
  float band = smoothstep(0.15, 1.0, y) * light;
  col += ca * band * 0.22 * mix(vec3(1.0), EMBER, 0.25);

  // Slow shafts of light angling down from the surface.
  float shaft = sin((uv.x * 3.4) + (uv.y * 1.2) - t * 0.25) * 0.5 + 0.5;
  shaft *= sin((uv.x * 7.1) - (uv.y * 0.8) + t * 0.17) * 0.5 + 0.5;
  col += shaft * band * 0.055;

  // Grain, so the gradient never bands on a wide screen.
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * 0.016;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export function Water({ depth }: { depth: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const depthRef = useRef(depth);
  depthRef.current = depth;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return; // CSS gradient underneath remains the fallback

    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uDepth = gl.getUniformLocation(prog, "u_depth");
    const uQuiet = gl.getUniformLocation(prog, "u_quiet");
    gl.uniform1f(uQuiet, quiet);

    // Half-resolution: this is a soft background, and it keeps laptops cool.
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
    const resize = () => {
      const w = Math.max(1, Math.floor(cv.clientWidth * DPR));
      const h = Math.max(1, Math.floor(cv.clientHeight * DPR));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, cv.width, cv.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      resize();
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform1f(uDepth, depthRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onLost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf); };
    cv.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      cv.removeEventListener("webglcontextlost", onLost);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
