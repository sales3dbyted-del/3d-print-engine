import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import * as THREE from 'three';

export interface EditorObject {
    id: string;
    type: string;
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color: string;
}

export const useStlExporter = () => {
    const exportToStl = (objectsList: EditorObject[]) => {
        if (objectsList.length === 0) return alert("Add some 3D shapes before exporting!");

        const exporter = new STLExporter();
        const printableGroup = new THREE.Group();

        objectsList.forEach((obj) => {
            //Avoid exporting 0-thickness elements like pure 2d planes to 3d printers
            if (obj.type === 'plane') return;

            let geometry: THREE.BufferGeometry;

            // Map primitive types to standard solid manifolds
            switch (obj.type) {
                case 'sphere':
                    geometry = new THREE.SphereGeometry(1, 32, 16);
                    break;
                case 'Cylinder':
                    geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
                    break;
                case 'Cone':
                    geometry = new THREE.ConeGeometry(1, 2, 32);
                    break;
                default:
                    geometry = new THREE.BoxGeometry(1, 1, 1);
            }

            const material = new THREE.MeshBasicMaterial();
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.fromArray(obj.position);
            mesh.rotation.fromArray(obj.rotation);
            mesh.scale.fromArray(obj.scale);

            printableGroup.add(mesh);
        });

        // Execute Binary conversions (5x compressed size comapred to ASCII)
        const result = exporter.parse(printableGroup, { binary: true });

        const blob = new Blob([result], { type: 'applications/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '3D-print-model.stl';
        link.click();
    };

    return { exportToStl }
};