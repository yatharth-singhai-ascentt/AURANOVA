class CarCustomizer {
    constructor(modelPath) {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.controls = null;
        this.modelPath = modelPath;
        this.customizableParts = {};
        this.originalMaterials = new Map();

        this.initScene();
        this.loadModel();
        this.setupEventListeners();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.camera.position.set(0, 2, 5);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        this.scene.add(ambientLight);

        // Main Directional Light (Front)
        const frontLight = new THREE.DirectionalLight(0xffffff, 2.0);
        frontLight.position.set(5, 5, 5);
        this.scene.add(frontLight);

        // Additional Spotlights
        const backLight = new THREE.SpotLight(0xffffff, 1.5);
        backLight.position.set(0, 1, -5); // Positioned behind the car
        backLight.castShadow = true;
        this.scene.add(backLight);

        const sideLightLeft = new THREE.SpotLight(0xffffff, 1.2);
        sideLightLeft.position.set(-5, 2, 0); // Positioned to the left
        sideLightLeft.castShadow = true;
        this.scene.add(sideLightLeft);

        const sideLightRight = new THREE.SpotLight(0xffffff, 1.2);
        sideLightRight.position.set(5, 2, 0); // Positioned to the right
        sideLightRight.castShadow = true;
        this.scene.add(sideLightRight);

        // Orbit Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;

        this.animate();
    }

    loadModel() {
        const loader = new THREE.GLTFLoader();
        loader.load(
            this.modelPath,
            (gltf) => {
                this.model = gltf.scene;
                this.scene.add(this.model);
                this.identifyCustomizableParts(this.model);

                // Store original materials after model is loaded
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        this.originalMaterials.set(child, child.material.clone());
                    }
                });
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.error('Model loading error:', error);
            }
        );
    }

    identifyCustomizableParts(model) {
        const partsToCustomize = {
            body: ['body', 'car_outer_body', 'main_body', 'chassis', 'paint',
                    'shell', 'exterior',  'bodywork',  'paint', 'outer', 'surface',
                    'car_body', 'main_body', 'body_panel', 'body_shell'],
            rims: ['rim', 'wheel', 'tire_rim'],
            interior: ['interior', 'seat', 'dashboard', 'cabin', 'cockpit', 'inside', 'upholstery'],
            accessories: ['mirror', 'handle', 'accessory', 'detail', 'trim', 'decoration']
        };

        model.traverse((child) => {
            if (child.isMesh) {
                this.originalMaterials.set(child, child.material.clone());
            }
        });

        this.customizableParts = {
            body: [],
            rims: [],
            interior: [],
            accessories: []
        };

        model.traverse((child) => {
            if (child.isMesh) {
                const childNameLower = child.name.toLowerCase();
                Object.keys(partsToCustomize).forEach((partType) => {
                    if (partsToCustomize[partType].some((keyword) =>
                        childNameLower.includes(keyword)
                    )) {
                        this.customizableParts[partType].push(child);
                    }
                });
            }
        });
    }

    changeMaterialColor(partType, color) {
        const parts = this.customizableParts[partType];
        if (!parts) return;

        parts.forEach((part) => {
            if (part.material) {
                part.material.color.set(color);
                part.material.needsUpdate = true;
            }
        });
    }

    resetColors() {
        if (!this.model) return;

        this.model.traverse((child) => {
            if (child.isMesh && this.originalMaterials.has(child)) {
                // Create a new material that is a clone of the original
                const originalMaterial = this.originalMaterials.get(child);
                child.material = originalMaterial.clone();
                child.material.needsUpdate = true;
            }
        });
    }

    moveToView(position, target) {
        this.controls.target.copy(target);
        this.camera.position.copy(position);
        this.controls.update();
    }

    setupEventListeners() {
        const partSelector = document.getElementById('part-selector');
        const colorPicker = document.getElementById('color-picker');
        const applyColorBtn = document.getElementById('apply-color');
        const resetColorsBtn = document.getElementById('reset-colors');
        const viewInteriorBtn = document.getElementById('view-interior');
        const viewExteriorBtn = document.getElementById('view-exterior');
        const bgColorPicker = document.getElementById('bg-color-picker');
        const cameraAngleSelector = document.getElementById('camera-angle');
        const downloadButton = document.getElementById('download-button');
        // Dynamic Part Selector Update
        const updatePartSelector = (isExterior) => {
            // Clear existing options
            partSelector.innerHTML = '';

            if (isExterior) {
                // Exterior view options
                const bodyOption = document.createElement('option');
                bodyOption.value = 'body';
                bodyOption.textContent = 'Car Body';

                const rimsOption = document.createElement('option');
                rimsOption.value = 'rims';
                rimsOption.textContent = 'Wheel Rims';

                partSelector.appendChild(bodyOption);
                partSelector.appendChild(rimsOption);
            } else {
                // Interior view options
                const seatOption = document.createElement('option');
                seatOption.value = 'interior';
                seatOption.textContent = 'Seat Cover';

                const accessoriesOption = document.createElement('option');
                accessoriesOption.value = 'accessories';
                accessoriesOption.textContent = 'Accessories';

                partSelector.appendChild(seatOption);
                partSelector.appendChild(accessoriesOption);
            }
        };

        applyColorBtn.addEventListener('click', () => {
            const selectedPart = partSelector.value;
            const selectedColor = colorPicker.value;
            this.changeMaterialColor(selectedPart, selectedColor);
        });

        resetColorsBtn.addEventListener('click', () => {
            this.resetColors();
        });

        viewInteriorBtn.addEventListener('click', () => {
            this.moveToView(new THREE.Vector3(0, 1.5, -2), new THREE.Vector3(0, 1, 0));
            updatePartSelector(false);
        });

        viewExteriorBtn.addEventListener('click', () => {
            this.moveToView(new THREE.Vector3(0, 2, 5), new THREE.Vector3(0, 1, 0));
            updatePartSelector(true);
        });

        // Initial setup for exterior view
        updatePartSelector(true);

        // Background Color Picker functionality
        bgColorPicker.addEventListener('change', (event) => {
            this.scene.background = new THREE.Color(event.target.value);
        });

        // Camera Angle Selector functionality
        cameraAngleSelector.addEventListener('change', (event) => {
            const selectedAngle = event.target.value;
            switch (selectedAngle) {
                case 'front':
                    this.moveToView(new THREE.Vector3(0, 2, 5), new THREE.Vector3(0, 1, 0));
                    break;
                case 'side':
                    this.moveToView(new THREE.Vector3(5, 2, 0), new THREE.Vector3(0, 1, 0));
                    break;
                case 'top':
                    this.moveToView(new THREE.Vector3(0, 10, 0), new THREE.Vector3(0, 1, 0));
                    break;
                default:
                    this.moveToView(new THREE.Vector3(0, 2, 5), new THREE.Vector3(0, 1, 0));
                    break;
            }
        });

        downloadButton.addEventListener('click', () => {
            this.downloadCustomizedModel();
        });

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    downloadCustomizedModel() {
        if (!this.model) {
            console.error('No model loaded to download');
            return;
        }

        const customizedScene = this.model.clone();

        customizedScene.traverse((child) => {
            if (child.isMesh) {
                const newMaterial = child.material.clone();
                newMaterial.color.copy(child.material.color);
                child.material = newMaterial;
            }
        });

        const exporter = new THREE.GLTFExporter();
        exporter.parse(
            customizedScene,
            (result) => {
                saveArrayBuffer(result, 'CUST.glb');
                setTimeout(() => { window.location.href = '/generate_qr'; }, 500);
            },
            {
                binary: true
            }
        );
    }
}

function saveArrayBuffer(buffer, fileName) {
    save(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
}

function save(blob, fileName) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

function downloadCar() {
    carCustomizer.downloadCustomizedModel();
}

let carCustomizer;

document.addEventListener('DOMContentLoaded', (event) => {
    const canvasContainer = document.getElementById('canvas-container');
    const modelPath = canvasContainer.getAttribute('data-model-path');
    carCustomizer = new CarCustomizer(modelPath);
});