'use client';

import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from 'three';
import { EditorObject } from "./useStlExporter";

interface ViewportProps {
    objects: EditorObject[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

// Helper function to create solid geometrics on demand
function createPrimitiveGeometry(type: string): THREE.BufferGeometry {
    const typeLower = type.toLowerCase();

    switch (typeLower) {
        case 'sphere':
            return new THREE.SphereGeometry(0.5, 32, 16);
        case 'cylinder':
            return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        case 'cone':
            return new THREE.ConeGeometry(0.5, 1, 32);
        case 'torus':
            return new THREE.TorusGeometry(0.5, 0.15, 16, 100);
        case 'plane':
            return new THREE.PlaneGeometry(1, 1);
        case 'cuboid':
            default:
                return new THREE.BoxGeometry(1, 1, 1);
    }
}

export const ViewportObjects: React.FC<ViewportProps> = ({ objects, selectedId, onSelect }) => {
    return (
        <>
            {objects.map((obj) => {
                const isSelected = selectedId === obj.id;
                const geometry = createPrimitiveGeometry(obj.type);

                return (
                    <group
                        key={obj.id}
                        position={[...obj.position]}
                        rotation={[...obj.rotation]}
                        scale={[...obj.scale]}
                        onClick={(e: ThreeEvent<MouseEvent>) => {
                            e.stopPropagation();
                            onSelect(obj.id);
                        }}
                    >

                        {/* Solid Mesh Material */}
                        <mesh geometry={geometry}>
                            <meshStandardMaterial 
                                color={obj.color}
                                roughness={0.6}
                                metalness={0.1}
                                side={THREE.DoubleSide}
                            />
                        </mesh>

                        {/* Selected Outline */}
                        {isSelected && (
                            <mesh>
                                <boxGeometry args={[1.05, 1.05, 1.05]} />
                                <meshBasicMaterial color="#00FFFF" wireframe />
                            </mesh>
                        )}
                    </group>
                );
            })}
        </>
    );
};