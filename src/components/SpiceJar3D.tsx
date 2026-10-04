import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SpiceJar3DProps {
  size?: number; // Size in pixels
  isSpinning?: boolean;
  speed?: number;
  showParticles?: boolean;
}

export const SpiceJar3D: React.FC<SpiceJar3DProps> = ({
  size = 120,
  isSpinning = true,
  speed = 0.02,
  showParticles = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const canvasElement = renderer.domElement;
    container.appendChild(canvasElement);

    // 3. Group for Jar
    const jarGroup = new THREE.Group();
    scene.add(jarGroup);

    // Glass Jar Body (Cylinder)
    const glassGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.8, 32);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.8,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    jarGroup.add(glassMesh);

    // Gold Metallic Lid
    const lidGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.35, 32);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.position.y = 1.05;
    jarGroup.add(lidMesh);

    // Golden Spice Contents inside Jar
    const spiceGeo = new THREE.CylinderGeometry(0.72, 0.72, 1.2, 32);
    const spiceMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.8,
      metalness: 0.2,
    });
    const spiceMesh = new THREE.Mesh(spiceGeo, spiceMat);
    spiceMesh.position.y = -0.2;
    jarGroup.add(spiceMesh);

    // Floating Golden Glitter Particles inside Jar
    let particleSystem: THREE.Points | null = null;
    if (showParticles) {
      const pCount = 80;
      const pGeo = new THREE.BufferGeometry();
      const pPositions = new Float32Array(pCount * 3);

      for (let i = 0; i < pCount; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 1.2;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 1.4;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
      }

      pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

      const pMat = new THREE.PointsMaterial({
        color: 0xfef08a,
        size: 0.08,
        transparent: true,
        opacity: 0.9,
      });

      particleSystem = new THREE.Points(pGeo, pMat);
      jarGroup.add(particleSystem);
    }

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xf59e0b, 3, 10);
    pointLight1.position.set(2, 3, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3b82f6, 2, 10);
    pointLight2.position.set(-2, -2, 3);
    scene.add(pointLight2);

    // 5. Animation Loop
    let animId: number;
    const animate = () => {
      if (isSpinning) {
        jarGroup.rotation.y += speed;
        jarGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.15;
      }

      if (particleSystem) {
        particleSystem.rotation.y -= speed * 1.5;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (canvasElement && canvasElement.parentNode) {
        canvasElement.parentNode.removeChild(canvasElement);
      }
      renderer.dispose();
    };
  }, [size, isSpinning, speed, showParticles]);

  return (
    <div className="relative flex items-center justify-center">
      <div ref={mountRef} style={{ width: size, height: size }} />
    </div>
  );
};
