'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import type { Object3D } from 'three';
import { ViewportObjects } from './ViewportObjects';
import { EditorObject } from './useStlExporter';

interface CanvasProps {
    objects: EditorObject[];
    selectedId: string | null;
    transformMode: 'translate' | 'rotate' | 'scale';
    onSelect: (id: string | null) => void;
    onUpdateObject: (id: string, updateProps: Partial<EditorObject>) => void;
}

export const SceneCanvas: React.FC<CanvasProps> = ({
    objects,
    selectedId,
    transformMode,
    onSelect,
    onUpdateObject,
}) => {
    return (
        <div className="w-full h-full bg-neutral-950">
            <Canvas
                camera={{ position: [10, 10, 10], fov: 45 }}
                onPointerDown={(e) => {
                    // Deselect when clicking on empty canvas background
                    if (e.target === e.currentTarget) onSelect(null);
                }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 20, 15]} intensity={0.8} />
                <directionalLight position={[-10, -20, -15]} intensity={0.3} />

                <gridHelper args={[50, 50, '#444444', '#222222']} position={[0, 0, 0]} />

                <ViewportObjects objects={objects} selectedId={selectedId} onSelect={onSelect} />

                {/* Mouse Drag Gizmo for Active Selection */}
                {selectedId && (
                    <TransformControls 
                        key={selectedId}
                        mode={transformMode}
                        onObjectChange={(e) => {
                            // Cast event target to Object3D to solve TypeScript error
                            const target = (e?.target as unknown as { object: Object3D })?.object;
                            if (target) {
                                onUpdateObject(selectedId, {
                                    position: [target.position.x, target.position.y, target.position.z],
                                    rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
                                    scale: [target.scale.x, target.scale.y, target.scale.z],
                                });
                            }
                        }}
                    />
                )}

                <OrbitControls makeDefault dampingFactor={0.05} />
            </Canvas>
        </div>
    );
};