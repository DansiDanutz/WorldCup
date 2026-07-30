import { useEffect, useRef, useState } from "react";

/**
 * The painting under water: a very low-amplitude refraction that answers the
 * pointer. Amplitude is deliberately tiny — a buyer must still see the work
 * honestly. Falls back to a plain <img> without WebGL.
 */

const VERT = `attribute vec2 a; varying vec2 v; void main(){ v = a * 0.5 + 0.5; gl_Position = vec4(a,0.,1.); }`;

const FRAG = `
precision highp float;
varying vec2 v;
uniform sampler2D u_tex;
uniform float u_time;
uniform vec2  u_mouse;   // 0..1, y up
uniform float u_hover;   // eased 0..1
uniform float u_quiet;

void main(){
  vec2 uv = vec2(v.x, 1.0 - v.y);
  float t = u_time * (u_quiet > 0.5 ? 0.0 : 1.0);

  // Ambient swell — barely there.
  vec2 d = vec2(
    sin(uv.y * 22.0 + t * 0.7) * 0.0013,
    cos(uv.x * 18.0 - t * 0.55) * 0.0011
  );

  // A ring travelling out from the pointer.
  vec2 m = vec2(u_mouse.x, 1.0 - u_mouse.y);
  float dist = distance(uv, m);
  float ring = sin(dist * 46.0 - t * 3.4) * exp(-dist * 7.0);
  d += normalize(uv - m + 1e-5) * ring * 0.006 * u_hover;

  vec3 col = texture2D(u_tex, uv + d).rgb;

  // A whisper of chromatic split on the ring keeps it feeling like water.
  float rr = texture2D(u_tex, uv + d * 1.35).r;
  col.r = mix(col.r, rr, 0.5 * u_hover);

  // Cool the deepest corners very slightly, as water does.
  col *= 1.0 - smoothstep(0.55, 1.25, distance(uv, vec2(0.5))) * 0.12;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
  return s;
}

export function Ripple({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(false);
  const mouse = useRef({ x: 0.5, y: 0.5, hover: 0, target: 0 });

  useEffect(() => {
    const canvas = cv.current;
    const box = wrap.current;
    if (!canvas || !box) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
    let raf = 0;
    let disposed = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (disposed) return;
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return;
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

      const uTime = gl.getUniformLocation(prog, "u_time");
      const uMouse = gl.getUniformLocation(prog, "u_mouse");
      const uHover = gl.getUniformLocation(prog, "u_hover");
      gl.uniform1f(gl.getUniformLocation(prog, "u_quiet"), quiet);
      gl.uniform1i(gl.getUniformLocation(prog, "u_tex"), 0);

      setOk(true);

      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      const t0 = performance.now();
      const loop = () => {
        const w = Math.max(1, Math.floor(box.clientWidth * DPR));
        const h = Math.max(1, Math.floor(box.clientHeight * DPR));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
        }
        const m = mouse.current;
        m.hover += (m.target - m.hover) * 0.07;
        gl.uniform1f(uTime, (performance.now() - t0) / 1000);
        gl.uniform2f(uMouse, m.x, m.y);
        gl.uniform1f(uHover, m.hover);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(loop);
      };
      loop();
    };
    img.src = src;

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      mouse.current.x = (e.clientX - r.left) / r.width;
      mouse.current.y = (e.clientY - r.top) / r.height;
      mouse.current.target = 1;
    };
    const onLeave = () => { mouse.current.target = 0; };
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerleave", onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
    };
  }, [src]);

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className="block h-auto w-full"
        style={{ visibility: ok ? "hidden" : "visible" }}
      />
      <canvas
        ref={cv}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{ opacity: ok ? 1 : 0, transition: "opacity .6s ease" }}
      />
    </div>
  );
}
