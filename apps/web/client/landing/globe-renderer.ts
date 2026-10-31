import land from "./globe-land-points.json";
import landCountries from "./globe-land-countries.json";
import { clampViewLatitude, geographicVector, INITIAL_LONGITUDE, INITIAL_VIEW_LATITUDE } from "./globe-geometry";
import { advanceMotion, boundedVelocity, DEFAULT_VELOCITY, wrapLongitude } from "./globe-motion";

const vertex = `
attribute vec2 aPosition;
varying vec2 vPosition;
void main() {
  vPosition = aPosition;
  gl_Position = vec4(aPosition * .88, 0., 1.);
}`;

const sphereFragment = `
precision mediump float;
varying vec2 vPosition;
uniform float uPixels;
uniform vec3 uShade;
uniform vec3 uLight;
void main() {
  float radius = dot(vPosition, vPosition);
  if (radius > 1.) discard;
  vec3 normal = vec3(vPosition, sqrt(1. - radius));
  float light = max(0., dot(normal, normalize(vec3(-.45, .65, 1.))));
  float edge = pow(1. - normal.z, 2.);
  vec3 color = mix(uShade, uLight, light);
  color -= edge * .028;
  float alpha = 1. - smoothstep(1. - 3. / uPixels, 1., radius);
  gl_FragColor = vec4(color, alpha);
}`;

const pointVertex = `
attribute vec3 aPosition;
attribute float aState;
uniform float uLongitude;
uniform float uTilt;
uniform float uSize;
uniform float uLitMix;
uniform float uActiveMix;
varying float vDepth;
varying float vLit;
void main() {
  vLit = min(aState, 1.) * uLitMix + max(aState - 1., 0.) * uActiveMix * .55;
  float x = cos(uLongitude) * aPosition.x - sin(uLongitude) * aPosition.z;
  float z = sin(uLongitude) * aPosition.x + cos(uLongitude) * aPosition.z;
  float y = cos(uTilt) * aPosition.y - sin(uTilt) * z;
  vDepth = sin(uTilt) * aPosition.y + cos(uTilt) * z;
  gl_Position = vec4(x * .88, y * .88, 0., 1.);
  gl_PointSize = uSize * (1. + max(aState - 1., 0.) * uActiveMix * .3);
}`;

const pointFragment = `
precision mediump float;
varying float vDepth;
varying float vLit;
uniform vec3 uLand;
uniform vec3 uLit;
void main() {
  if (vDepth <= .025) discard;
  float radius = length(gl_PointCoord - .5);
  float alpha = (1. - smoothstep(.28, .5, radius)) * (.32 + .38 * vDepth) * (1. + vLit * .55);
  gl_FragColor = vec4(mix(uLand, uLit, min(1., vLit * .7 + max(vLit - 1., 0.))), min(1., alpha));
}`;

export type GlobeRenderer = {
  setMotion: (playing: boolean) => void;
  setHighlight: (litCountryCodes: ReadonlySet<string>, activeCountryCode: string | null, animate: boolean) => void;
  rotate: (longitudeDegrees: number, latitudeDegrees?: number) => void;
  dispose: () => void;
};

export function createGlobeRenderer(
  canvas: HTMLCanvasElement,
  stage: HTMLDivElement,
  onFrame: (longitude: number, latitude: number, frameTime: number) => void,
  onUnavailable: () => void,
): GlobeRenderer {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
    premultipliedAlpha: false,
  });
  if (!gl) throw new Error("WebGL unavailable");

  const buffers: WebGLBuffer[] = [];
  const programs: WebGLProgram[] = [];
  const shaders: WebGLShader[] = [];
  let disposed = false;
  let frame = 0;
  let playing = false;
  let visible = true;
  let longitude = INITIAL_LONGITUDE;
  let latitude = INITIAL_VIEW_LATITUDE;
  let presentedLongitude = INITIAL_LONGITUDE;
  let presentedLatitude = INITIAL_VIEW_LATITUDE;
  let lastTime = 0;
  let dirty = false;
  let litMix = 0;
  let activeMix = 0;
  let litTween: Tween = { from: 0, to: 0, start: 0, duration: 0 };
  let activeTween: Tween = { from: 0, to: 0, start: 0, duration: 0 };
  let longitudeVelocity = DEFAULT_VELOCITY;
  let latitudeVelocity = 0;
  let drag: { id: number; startX: number; startY: number; x: number; y: number; time: number; active: boolean } | null = null;
  let resizeObserver: ResizeObserver | undefined;
  let intersectionObserver: IntersectionObserver | undefined;
  let themeObserver: MutationObserver | undefined;

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    endDrag(false);
    stage.removeEventListener("pointerdown", pointerDown);
    stage.removeEventListener("pointermove", pointerMove);
    stage.removeEventListener("pointerup", pointerUp);
    stage.removeEventListener("pointercancel", pointerCancelled);
    stage.removeEventListener("lostpointercapture", pointerCancelled);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    themeObserver?.disconnect();
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", visibilityChanged);
    canvas.removeEventListener("webglcontextlost", contextLost);
    for (const buffer of buffers) gl!.deleteBuffer(buffer);
    for (const program of programs) gl!.deleteProgram(program);
    for (const shader of shaders) gl!.deleteShader(shader);
    gl!.getExtension("WEBGL_lose_context")?.loseContext();
  }

  function contextLost() {
    dispose();
    onUnavailable();
  }

  function program(vertexSource: string, fragmentSource: string) {
    const result = gl!.createProgram();
    if (!result) throw new Error("Globe program unavailable");
    programs.push(result);
    for (const [type, source] of [[gl!.VERTEX_SHADER, vertexSource], [gl!.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl!.createShader(type);
      if (!shader) throw new Error("Globe shader unavailable");
      shaders.push(shader);
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error("Globe shader failed");
      gl!.attachShader(result, shader);
    }
    gl!.linkProgram(result);
    if (!gl!.getProgramParameter(result, gl!.LINK_STATUS)) throw new Error("Globe program failed");
    return result;
  }

  function buffer(data: Float32Array) {
    const result = gl!.createBuffer();
    if (!result) throw new Error("Globe buffer unavailable");
    buffers.push(result);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, result);
    gl!.bufferData(gl!.ARRAY_BUFFER, data, gl!.STATIC_DRAW);
    return result;
  }

  let draw: () => void;
  function requestFrame() {
    if (!frame && !disposed && visible && !document.hidden && (dirty || tweening() || (playing && !drag))) {
      frame = requestAnimationFrame(tick);
    }
  }

  function tick(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    if (time - lastTime >= 1000 / 30) {
      if (playing && !drag) {
        const nextLongitude = advanceMotion(longitudeVelocity, time - lastTime);
        const nextLatitude = advanceMotion(latitudeVelocity, time - lastTime, 0);
        longitudeVelocity = nextLongitude.velocity;
        latitudeVelocity = nextLatitude.velocity;
        longitude = wrapLongitude(longitude + nextLongitude.distance);
        latitude = clampViewLatitude(latitude + nextLatitude.distance);
      }
      lastTime = time;
      dirty = false;
      litMix = sampleTween(litTween, time);
      activeMix = sampleTween(activeTween, time);
      draw();
    }
    requestFrame();
  }

  function tweening() {
    return litMix !== litTween.to || activeMix !== activeTween.to;
  }

  function syncMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = performance.now();
    requestFrame();
  }

  function endDrag(inertia: boolean) {
    const previous = drag;
    drag = null;
    stage.removeAttribute("data-dragging");
    if (!inertia || !playing || !previous?.active || performance.now() - previous.time > 100) {
      longitudeVelocity = DEFAULT_VELOCITY;
      latitudeVelocity = 0;
    }
    if (previous && stage.hasPointerCapture(previous.id)) stage.releasePointerCapture(previous.id);
    syncMotion();
  }

  function pointerDown(event: PointerEvent) {
    if (!event.isPrimary) { endDrag(false); return; }
    if (event.button !== 0 || disposed || !visible || document.hidden) return;
    endDrag(false);
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, time: performance.now(), active: false };
    try { stage.setPointerCapture(event.pointerId); }
    catch { drag = null; return; }
    syncMotion();
  }

  function pointerMove(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.active) {
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 4) return;
      drag.active = true;
      stage.setAttribute("data-dragging", "true");
    }
    const now = performance.now();
    const width = Math.max(1, stage.getBoundingClientRect().width);
    const longitudeDistance = -(event.clientX - drag.x) / width * 180;
    const latitudeDistance = (event.clientY - drag.y) / width * 180;
    longitude = wrapLongitude(longitude + longitudeDistance);
    latitude = clampViewLatitude(latitude + latitudeDistance);
    const elapsed = Math.max(8, now - drag.time);
    const longitudeSample = boundedVelocity(longitudeDistance / elapsed);
    const latitudeSample = boundedVelocity(latitudeDistance / elapsed);
    longitudeVelocity = boundedVelocity(longitudeVelocity * .25 + longitudeSample * .75);
    latitudeVelocity = boundedVelocity(latitudeVelocity * .25 + latitudeSample * .75);
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.time = now;
    dirty = true;
    requestFrame();
  }

  function pointerUp(event: PointerEvent) {
    if (event.pointerId === drag?.id) endDrag(true);
  }

  function pointerCancelled(event: PointerEvent) {
    if (event.pointerId === drag?.id) endDrag(false);
  }

  function suspend() {
    endDrag(false);
    longitude = presentedLongitude;
    latitude = presentedLatitude;
    dirty = false;
  }

  function visibilityChanged() {
    if (document.hidden) suspend();
    else resize();
    syncMotion();
  }

  function resize() {
    if (disposed) return;
    const size = Math.max(1, Math.min(960, Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 1.5))));
    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size;
      canvas.height = size;
      gl!.viewport(0, 0, size, size);
    }
    if (visible && !document.hidden) draw();
  }

  try {
    const sphere = program(vertex, sphereFragment);
    const dots = program(pointVertex, pointFragment);
    const quad = buffer(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
    const positions = new Float32Array(land.length / 2 * 3);
    for (let i = 0; i < land.length; i += 2) {
      positions.set(geographicVector(land[i], land[i + 1]), i / 2 * 3);
    }
    const points = buffer(positions);
    const states = new Float32Array(positions.length / 3);
    const stateCodes = Array.from(states, (_, index) => landCountries.slice(index * 2, index * 2 + 2));
    const stateBuffer = buffer(states);
    const spherePosition = gl.getAttribLocation(sphere, "aPosition");
    const pointPosition = gl.getAttribLocation(dots, "aPosition");
    const pointState = gl.getAttribLocation(dots, "aState");
    const litUniform = gl.getUniformLocation(dots, "uLit");
    const litMixUniform = gl.getUniformLocation(dots, "uLitMix");
    const activeMixUniform = gl.getUniformLocation(dots, "uActiveMix");
    const pixelsUniform = gl.getUniformLocation(sphere, "uPixels");
    const shadeUniform = gl.getUniformLocation(sphere, "uShade");
    const lightUniform = gl.getUniformLocation(sphere, "uLight");
    const landUniform = gl.getUniformLocation(dots, "uLand");
    const longitudeUniform = gl.getUniformLocation(dots, "uLongitude");
    const tiltUniform = gl.getUniformLocation(dots, "uTilt");
    const sizeUniform = gl.getUniformLocation(dots, "uSize");
    let paletteDirty = true;
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    function setColor(uniform: WebGLUniformLocation | null, token: string, style: CSSStyleDeclaration) {
      const raw = style.getPropertyValue(token).trim();
      const color = /^#[\da-f]{3}$/i.test(raw) ? `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}` : raw;
      if (!/^#[\da-f]{6}$/i.test(color)) return;
      const value = Number.parseInt(color.slice(1), 16);
      gl!.uniform3f(uniform, (value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255);
    }

    draw = () => {
      if (disposed) return;
      const style = paletteDirty ? getComputedStyle(stage) : null;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(sphere);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(spherePosition);
      gl.vertexAttribPointer(spherePosition, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(pixelsUniform, canvas.width);
      if (style) {
        setColor(shadeUniform, "--globe-sphere-shade", style);
        setColor(lightUniform, "--globe-sphere-light", style);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(spherePosition);
      gl.useProgram(dots);
      gl.bindBuffer(gl.ARRAY_BUFFER, points);
      gl.enableVertexAttribArray(pointPosition);
      gl.vertexAttribPointer(pointPosition, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);
      gl.enableVertexAttribArray(pointState);
      gl.vertexAttribPointer(pointState, 1, gl.FLOAT, false, 0, 0);
      if (style) {
        setColor(landUniform, "--globe-land", style);
        setColor(litUniform, "--globe-route", style);
      }
      gl.uniform1f(litMixUniform, litMix);
      gl.uniform1f(activeMixUniform, activeMix);
      paletteDirty = false;
      gl.uniform1f(longitudeUniform, longitude * Math.PI / 180);
      gl.uniform1f(tiltUniform, latitude * Math.PI / 180);
      gl.uniform1f(sizeUniform, Math.max(1.5, canvas.width * .0038));
      gl.drawArrays(gl.POINTS, 0, positions.length / 3);
      gl.disableVertexAttribArray(pointPosition);
      gl.disableVertexAttribArray(pointState);
      presentedLongitude = longitude;
      presentedLatitude = latitude;
      onFrame(longitude, latitude, performance.now());
    };

    stage.addEventListener("pointerdown", pointerDown);
    stage.addEventListener("pointermove", pointerMove);
    stage.addEventListener("pointerup", pointerUp);
    stage.addEventListener("pointercancel", pointerCancelled);
    stage.addEventListener("lostpointercapture", pointerCancelled);
    canvas.addEventListener("webglcontextlost", contextLost);
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("resize", resize);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    themeObserver = new MutationObserver(() => {
      paletteDirty = true;
      if (visible && !document.hidden) draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resize();
      else suspend();
      syncMotion();
    });
    intersectionObserver.observe(canvas);
    resize();

    return {
      setMotion(value) {
        playing = value;
        if (!value) {
          longitudeVelocity = DEFAULT_VELOCITY;
          latitudeVelocity = 0;
        }
        syncMotion();
      },
      setHighlight(litCountryCodes, activeCountryCode, animate) {
        if (disposed) return;
        let changed = false;
        let lit = false;
        for (let index = 0; index < states.length; index++) {
          const code = stateCodes[index];
          const state = code === activeCountryCode ? 2 : litCountryCodes.has(code) ? 1 : 0;
          if (state === 1) lit = true;
          if (states[index] !== state) {
            states[index] = state;
            changed = true;
          }
        }
        if (changed) {
          gl.bindBuffer(gl.ARRAY_BUFFER, stateBuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, states);
        }
        const now = performance.now();
        const litTarget = lit || activeCountryCode ? 1 : 0;
        if (litTween.to !== litTarget) litTween = startTween(litMix, litTarget, now, animate ? LIT_REVEAL_MS : 0);
        if (activeCountryCode) activeTween = startTween(0, 1, now, animate ? ACTIVE_MS : 0);
        else activeTween = startTween(activeMix, 0, now, 0);
        if (!animate) {
          litMix = litTween.to;
          activeMix = activeTween.to;
        }
        dirty = true;
        requestFrame();
      },
      rotate(longitudeDegrees, latitudeDegrees = 0) {
        if (disposed) return;
        endDrag(false);
        longitude = wrapLongitude(longitude + longitudeDegrees);
        latitude = clampViewLatitude(latitude + latitudeDegrees);
        dirty = true;
        requestFrame();
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

const LIT_REVEAL_MS = 400;
const ACTIVE_MS = 240;

type Tween = { from: number; to: number; start: number; duration: number };

function startTween(from: number, to: number, start: number, duration: number): Tween {
  return { from, to, start, duration };
}

function sampleTween({ from, to, start, duration }: Tween, time: number) {
  if (duration <= 0 || time >= start + duration) return to;
  const progress = Math.max(0, (time - start) / duration);
  const eased = 1 - Math.pow(1 - progress, 3);
  return from + (to - from) * eased;
}
