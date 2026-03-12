import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// Islamic geometric pattern texture generator
function createPatternTexture(
  baseColor: string,
  patternColor: string,
  patternType: number
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base fill
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = patternColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;

  const cx = size / 2;
  const cy = size / 2;

  if (patternType === 0) {
    // 8-pointed star
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 220, cy + Math.sin(angle) * 220);
      ctx.stroke();
    }
    for (let r = 40; r < 240; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Inner star
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const r = i % 2 === 0 ? 100 : 55;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  } else if (patternType === 1) {
    // Interlocking hexagons
    const hexR = 80;
    const drawHex = (hx: number, hy: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 6;
        const x = hx + Math.cos(a) * hexR;
        const y = hy + Math.sin(a) * hexR;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    };
    drawHex(cx, cy);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      drawHex(cx + Math.cos(a) * hexR * 1.73, cy + Math.sin(a) * hexR * 1.73);
    }
    // Central detail
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const r = i % 2 === 0 ? 50 : 30;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  } else if (patternType === 2) {
    // Radial mandala
    for (let ring = 0; ring < 4; ring++) {
      const n = 6 + ring * 6;
      const r = 40 + ring * 50;
      for (let i = 0; i < n; i++) {
        const a = (i * Math.PI * 2) / n;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.stroke();
  } else if (patternType === 3) {
    // Diamond tessellation
    const step = 60;
    for (let x = 0; x < size; x += step) {
      for (let y = 0; y < size; y += step) {
        ctx.beginPath();
        ctx.moveTo(x + step / 2, y);
        ctx.lineTo(x + step, y + step / 2);
        ctx.lineTo(x + step / 2, y + step);
        ctx.lineTo(x, y + step / 2);
        ctx.closePath();
        ctx.stroke();
      }
    }
    // Center ornament
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.moveTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30);
      ctx.lineTo(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80);
    }
    ctx.stroke();
  } else if (patternType === 4) {
    // Arabesque curves
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 12; i++) {
      const a1 = (i * Math.PI) / 6;
      const a2 = ((i + 1) * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * 200, cy + Math.sin(a1) * 200);
      ctx.quadraticCurveTo(
        cx + Math.cos((a1 + a2) / 2) * 80,
        cy + Math.sin((a1 + a2) / 2) * 80,
        cx + Math.cos(a2) * 200,
        cy + Math.sin(a2) * 200
      );
      ctx.stroke();
    }
    for (let r = 30; r <= 150; r += 40) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // Nested squares with rotation
    for (let i = 0; i < 8; i++) {
      const s = 30 + i * 28;
      const rot = (i * Math.PI) / 16;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      ctx.restore();
    }
  }

  // Border frame
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, size - 16, size - 16);
  ctx.strokeRect(16, 16, size - 32, size - 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Face colors: warm celebratory palette
const FACE_CONFIGS: Array<{ base: string; pattern: string }> = [
  { base: '#8B1A1A', pattern: '#D4A843' }, // deep red + gold
  { base: '#1A4A3A', pattern: '#D4A843' }, // emerald + gold
  { base: '#2A1A4A', pattern: '#C9A84C' }, // deep purple + gold
  { base: '#4A2A0A', pattern: '#E8C860' }, // brown + bright gold
  { base: '#1A2A4A', pattern: '#D4A843' }, // navy + gold
  { base: '#4A1A2A', pattern: '#E8C860' }, // burgundy + bright gold
];

// Normal directions for each face
const FACE_NORMALS: THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0),   // right
  new THREE.Vector3(-1, 0, 0),  // left
  new THREE.Vector3(0, 1, 0),   // top
  new THREE.Vector3(0, -1, 0),  // bottom
  new THREE.Vector3(0, 0, 1),   // front
  new THREE.Vector3(0, 0, -1),  // back
];

// Rotation for each face to form the cube
const FACE_ROTATIONS: Array<[number, number, number]> = [
  [0, Math.PI / 2, 0],    // right
  [0, -Math.PI / 2, 0],   // left
  [Math.PI / 2, 0, 0],    // top (fix: negative rotation)
  [-Math.PI / 2, 0, 0],   // bottom
  [0, 0, 0],              // front
  [0, Math.PI, 0],        // back
];

// Ease-out cubic
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface UnfoldingCubeProps {
  onAnimationComplete: () => void;
}

export default function UnfoldingCube({ onAnimationComplete }: UnfoldingCubeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    faces: THREE.Mesh[];
    animationId: number;
    state: 'idle' | 'pulse' | 'unfolding' | 'done';
    animStart: number;
    pulseStart: number;
    hovered: boolean;
    raycaster: THREE.Raycaster;
    pointer: THREE.Vector2;
    cubeGroup: THREE.Group;
  } | null>(null);

  const [showHint, setShowHint] = useState(true);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.0);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);
    const backLight = new THREE.DirectionalLight(0xd4a843, 0.3);
    backLight.position.set(-2, -1, -3);
    scene.add(backLight);

    // Build 6 face meshes
    const cubeGroup = new THREE.Group();
    const faceSize = 1;
    const faces: THREE.Mesh[] = [];

    for (let i = 0; i < 6; i++) {
      const geometry = new THREE.PlaneGeometry(faceSize, faceSize);
      const texture = createPatternTexture(
        FACE_CONFIGS[i].base,
        FACE_CONFIGS[i].pattern,
        i
      );
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        metalness: 0.3,
        roughness: 0.5,
      });
      const mesh = new THREE.Mesh(geometry, material);

      // Position each face at half-size distance along its normal
      const half = faceSize / 2;
      mesh.position.copy(FACE_NORMALS[i].clone().multiplyScalar(half));
      mesh.rotation.set(...FACE_ROTATIONS[i]);

      // Store original transform for animation
      mesh.userData.origPos = mesh.position.clone();
      mesh.userData.origRot = mesh.rotation.clone();

      faces.push(mesh);
      cubeGroup.add(mesh);
    }

    scene.add(cubeGroup);

    // Gentle idle rotation
    cubeGroup.rotation.set(0.3, 0.4, 0);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    sceneRef.current = {
      renderer, scene, camera, faces, animationId: 0,
      state: 'idle', animStart: 0, pulseStart: 0, hovered: false,
      raycaster, pointer, cubeGroup,
    };

    // Animation loop
    const animate = () => {
      const s = sceneRef.current;
      if (!s) return;
      s.animationId = requestAnimationFrame(animate);

      const time = performance.now() / 1000;

      if (s.state === 'idle') {
        // Gentle auto-rotation
        s.cubeGroup.rotation.y = 0.4 + Math.sin(time * 0.5) * 0.15;
        s.cubeGroup.rotation.x = 0.3 + Math.sin(time * 0.3) * 0.1;

        /* Fitts's Law: Scale up on hover to signal interactivity and enlarge target */
        const targetScale = s.hovered ? 1.08 : 1.0;
        s.cubeGroup.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.1
        );
      } else if (s.state === 'pulse') {
        /* Doherty Threshold: Immediate visual feedback within 400ms of click */
        const elapsed = (performance.now() - s.pulseStart) / 1000;
        const pulseT = Math.min(elapsed / 0.35, 1);
        const pulseFactor = 1 + 0.15 * Math.sin(pulseT * Math.PI);
        s.cubeGroup.scale.set(pulseFactor, pulseFactor, pulseFactor);

        // Brighten all faces during pulse
        s.faces.forEach(face => {
          const mat = face.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.3 * Math.sin(pulseT * Math.PI);
          mat.emissive = new THREE.Color(0xd4a843);
        });

        if (pulseT >= 1) {
          s.state = 'unfolding';
          s.animStart = performance.now();
          // Reset emissive
          s.faces.forEach(face => {
            const mat = face.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0;
          });
        }
      } else if (s.state === 'unfolding') {
        const elapsed = (performance.now() - s.animStart) / 1000;
        const duration = 1.5;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(t);

        /* Gestalt Principles: Faces translate outward along normals, forming
           a coherent blooming pattern that reads as a unified flower/cross shape */
        const unfoldDist = 1.8;
        const rotAmount = Math.PI * 0.25;

        s.faces.forEach((face, i) => {
          const orig = face.userData.origPos as THREE.Vector3;
          const normal = FACE_NORMALS[i];

          // Translate outward along face normal
          face.position.copy(orig.clone().add(
            normal.clone().multiplyScalar(unfoldDist * eased)
          ));

          // Add slight rotation for bloom effect
          const origRot = face.userData.origRot as THREE.Euler;
          face.rotation.set(
            origRot.x + normal.y * rotAmount * eased,
            origRot.y + normal.x * rotAmount * eased * 0.5,
            origRot.z + normal.z * rotAmount * eased * 0.3
          );

          // Fade out slightly
          const mat = face.material as THREE.MeshStandardMaterial;
          mat.opacity = 1 - eased * 0.3;
          mat.transparent = true;
        });

        if (t >= 1) {
          s.state = 'done';
          /* Hick's Law: Progressive disclosure — message only appears after
             animation fully completes, one interaction → one outcome */
          onAnimationComplete();
        }
      }

      s.renderer.render(s.scene, s.camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!s) return;
      const s = sceneRef.current;
      if (!s || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      s.camera.aspect = w / h;
      s.camera.updateProjectionMatrix();
      s.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Pointer handlers (desktop + mobile)
    const updatePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const s = sceneRef.current;
      if (!s) return;
      s.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      s.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleHover = (e: PointerEvent) => {
      const s = sceneRef.current;
      if (!s || s.state !== 'idle') return;
      updatePointer(e.clientX, e.clientY);
      s.raycaster.setFromCamera(s.pointer, s.camera);
      const hits = s.raycaster.intersectObjects(s.faces);
      s.hovered = hits.length > 0;
      container.style.cursor = s.hovered ? 'pointer' : 'default';
    };

    const handleClick = (clientX: number, clientY: number) => {
      const s = sceneRef.current;
      if (!s || s.state !== 'idle') return;
      updatePointer(clientX, clientY);
      s.raycaster.setFromCamera(s.pointer, s.camera);
      const hits = s.raycaster.intersectObjects(s.faces);
      if (hits.length > 0) {
        s.state = 'pulse';
        s.pulseStart = performance.now();
        setShowHint(false);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      handleClick(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleClick(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    container.addEventListener('pointermove', handleHover);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('touchstart', onTouchStart, { passive: true });

    // Cleanup ref
    const cleanupRef = { handleResize, handleHover, onPointerDown, onTouchStart };
    (container as any).__cleanup = cleanupRef;

    return () => {
      window.removeEventListener('resize', cleanupRef.handleResize);
      container.removeEventListener('pointermove', cleanupRef.handleHover);
      container.removeEventListener('pointerdown', cleanupRef.onPointerDown);
      container.removeEventListener('touchstart', cleanupRef.onTouchStart);
      const s = sceneRef.current;
      if (s) {
        cancelAnimationFrame(s.animationId);
        s.renderer.dispose();
        s.renderer.domElement.remove();
        s.faces.forEach(f => {
          f.geometry.dispose();
          (f.material as THREE.MeshStandardMaterial).dispose();
          const tex = (f.material as THREE.MeshStandardMaterial).map;
          if (tex) tex.dispose();
        });
        sceneRef.current = null;
      }
    };
  }, [onAnimationComplete]);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {showHint && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hint-text text-sm md:text-base select-none pointer-events-none">
          Tap the cube to reveal
        </div>
      )}
    </div>
  );
}
