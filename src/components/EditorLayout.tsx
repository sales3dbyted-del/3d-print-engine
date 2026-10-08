'use client';

import React, { useState, useEffect, useCallback } from "react";
import { SceneCanvas } from "./SceneCanvas";
import { useStlExporter, EditorObject } from "./useStlExporter";

export default function EditorLayout()  {
    const [objects, setObjects] = useState<EditorObject[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
    const { exportToStl } = useStlExporter();

    const addShape = (shapeType: string) => {
        const newShape: EditorObject ={
            id: crypto.randomUUID(),
            type: shapeType,
            name: `${shapeType}_${objects.length + 1}`,
            position: [0, 0.5, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: '#e5e7eb',
        };
        setObjects((prev) => [...prev, newShape]);
        setSelectedId(newShape.id);
    };

    const updateObject = useCallback((id: string, updatedProps: Partial<EditorObject>) => {
        setObjects((prev) =>
        prev.map((obj) => (obj.id === id ? { ...obj, ...updatedProps } : obj))
    );
    }, []);

    const deleteSelected = useCallback(() => {
        if (!selectedId) return;
        setObjects((prev) => prev.filter((o) => o.id !== selectedId));
        setSelectedId(null);
    }, [selectedId]);

    const duplicateSelected = useCallback(() => {
        if (!selectedId) return;
        const target = objects.find((o) => o.id === selectedId);
        if (!target) return;

        const duplicated: EditorObject = {
            ...target,
            id: crypto.randomUUID(),
            name: `${target.name}_copy`,
            position: [target.position[0] + 1, target.position[1], target.position[2] + 1],
        };
        setObjects((prev) => [...prev, duplicated]);
        setSelectedId(duplicated.id);
    }, [selectedId, objects]);

    // Keyboard Shortcuts (Delete, Backspace, Ctrl-D)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't Trigger shortcuts if typing inside input field
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                deleteSelected();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                duplicateSelected();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteSelected, duplicateSelected]);

    const selectedObject = objects.find((o) => o.id === selectedId);

    const updateNumericProperty = (key: 'position' | 'rotation' | 'scale', axisIndex: number, value: number) => {
        if (!selectedId || !selectedObject) return;
        const updatedArray = [...selectedObject[key]] as [number, number, number];
        updatedArray[axisIndex] = value;
        updateObject(selectedId, { [key]: updatedArray });
    };

    return (
        <div className="flex h-screen w-screen bg-zinc-800 text-zinc-900 select-none overflow-hidden font-mono p-4 gap-4">
            {/* Sidebar Controls */}
            <div className="w-80 bg-zinc-200 border-4 border-zinc-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] p-4 flex flex-col gap-4 overflow-y-auto">
                <div className="text-center border-b-4 border-zinc-900 pb-2">
                    <h1 className="text-2xl font-black tracking-wider">3D PRINT ENGINE</h1>
                    <p className="text-xs italic text-zinc-600">Phase2: Mouse Controls & Actions</p>
                </div>

                {/* Shape Spawner */}
                <div className="flex flex-col gap-2">
                    <h2 className="bg-zinc-400 font-bold px-2 py-0.5 border border-zinc-900 text-sm">ADD PRIMITIVE</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {['Cuboid', 'Sphere', 'Cylinder', 'Cone', 'Torus', 'Plane'].map((shape) => (
                            <button
                                key={shape}
                                onClick={() => addShape(shape)}
                                className="bg-white border-2 border-zinc-900 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:translate-y-1"
                            >
                                {shape.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gizmo Mode Switcher */}
                {selectedObject && (
                    <div className="flex flex-col gap-2 border-t-2 border-zinc-400 pt-2">
                        <h2 className="bg-zinc-400 font-bold px-2 py-0.5 border border-zinc-900 text-sm">GIZMO MODE</h2>
                        <div className="grid grid-cols-3 gap-1">
                            {(['translate', 'rotate', 'scale'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setTransformMode(mode)}
                                    className={`border-2 border-zinc-900 py-1 text-xs font-bold uppercase ${
                                        transformMode === mode ? 'bg-amber-400' : 'bg-white'
                                    }`}
                                >
                                    {mode.slice(0, 5)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Selected Object Actions & Transforms */}
                {selectedObject && (
                    <div className="flex flex-col gap-3 border-t-2 border-zinc-400 pt-2">
                        <h2 className="bg-zinc-400 font-bold px-2 py-0.5 border border-zinc-900 text-sm">
                            ACTIONS ({selectedObject.name})
                        </h2>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={duplicateSelected}
                                className="bg-sky-300 border-2 border-zinc-900 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                            >
                                DUPLICATE (Ctrl+D)
                            </button>
                            <button 
                                onClick={deleteSelected}
                                className="bg-rose-400 border-2 border-zinc-900 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                            >
                                DELETE (Del)
                            </button>
                        </div>

                        {/* Transform Numerical Inputs */}
                        <div className="flex flex-col gap-2 text-xs">
                            <label className="font-bold">Position X / Y / Z</label>
                            <div className="grid grid-cols-3 gap-1">
                                {selectedObject.position.map((val, i) => (
                                    <input 
                                        key={i}
                                        type="number"
                                        step="0.1"
                                        value={Number(val.toFixed(2))}
                                        onChange={(e) => updateNumericProperty('position', i, parseFloat(e.target.value) || 0)}
                                        className="border-2 border-zinc-900 p-1 bg-white text-center"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Block */}
                <div className="mt-auto pt-4 border-t-4 border-zinc-900 flex flex-col gap-2">
                    <button
                        onClick={() => exportToStl(objects)}
                        className="bg-emerald-500 text-white border-2 border-zinc-900 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5"
                    >
                        Export STL for Slicer
                    </button>
                </div>
            </div>

            {/* Render Viewport */}
            <div className="flex-1 bg-black border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
                <SceneCanvas 
                    objects={objects}
                    selectedId={selectedId}
                    transformMode={transformMode}
                    onSelect={setSelectedId}
                    onUpdateObject={updateObject}
                />
            </div>
        </div>
    );
}