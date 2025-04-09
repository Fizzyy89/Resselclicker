// Import game configurations
import { staff as buildings, upgrades } from './gameConfig.js';  // Import staff as buildings for backwards compatibility

// Lade die Zitate
let clickQuotes = [];
let idleQuotes = [];
let lastClickTime = Date.now();
let idleCheckInterval = null;

fetch('quotes.json')
    .then(response => response.json())
    .then(data => {
        clickQuotes = data.clickQuotes;
        idleQuotes = data.idleQuotes;
        startIdleCheck();
    })
    .catch(error => console.error('Error loading quotes:', error));

// Get DOM elements
const coinCountElement = document.getElementById('coin-count');
const resselImage = document.getElementById('ressel-image');
const upgradesContainer = document.getElementById('upgrades');
const floatingTextContainer = document.getElementById('floating-text-container');

// Tutorial Link Event Listener
document.addEventListener('DOMContentLoaded', () => {
    // Lade die aktuelle Version aus dem Tutorial
    fetchCurrentVersion();
    
    const tutorialLink = document.querySelector('.text-emerald-400.cursor-pointer');
    if (tutorialLink) {
        tutorialLink.addEventListener('click', (e) => {
            e.preventDefault();
            openTutorial();
        });
    }
    
    // Event Listener für das Versions-Badge
    const versionBadge = document.getElementById('version-badge');
    if (versionBadge) {
        versionBadge.addEventListener('click', (e) => {
            e.preventDefault();
            openTutorial('changelog');
        });
    }
});

// Funktion zum Abrufen der aktuellen Version aus dem Tutorial
function fetchCurrentVersion() {
    fetch('tutorial.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Finde den ersten Changelog-Eintrag (aktuellste Version)
            const firstVersionElement = doc.querySelector('.changelog-item .text-lg.font-bold.text-purple-400');
            
            if (firstVersionElement) {
                // Extrahiere die Versionsnummer
                const versionText = firstVersionElement.textContent.trim();
                const versionBadge = document.querySelector('.text-xs.bg-purple-900\\/60');
                
                if (versionBadge) {
                    versionBadge.textContent = 'v' + versionText.replace('Version ', '');
                }
            }
        })
        .catch(error => console.error('Error loading version:', error));
}

// Funktion zum Öffnen des Tutorials
function openTutorial(scrollTarget) {
    // Erstelle das Modal-Overlay
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    modal.style.backdropFilter = 'blur(5px)';

    // Einfachere Implementierung: Nutze einen iframe statt Content-Extraktion
    modal.innerHTML = `
        <div class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-transparent rounded-xl">
            <iframe src="tutorial.html" class="w-full h-[90vh] border-0" id="tutorial-iframe"></iframe>
        </div>
    `;

    // Füge das Modal zum Body hinzu
    document.body.appendChild(modal);

    // Verhindere Scrollen des Hintergrunds
    document.body.style.overflow = 'hidden';

    // Event Listener zum Schließen
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });

    // Event Listener für Nachrichten aus dem iframe
    window.addEventListener('message', function(event) {
        if (event.data === 'close-tutorial') {
            modal.remove();
            document.body.style.overflow = '';
        }
    }, { once: true }); // Nur einmal ausführen
    
    // Wenn ein Scroll-Ziel angegeben wurde, scrolle dorthin sobald der iframe geladen ist
    if (scrollTarget) {
        const iframe = document.getElementById('tutorial-iframe');
        if (iframe) {
            iframe.addEventListener('load', () => {
                // Sende eine Nachricht an den iframe, um zum Ziel zu scrollen
                iframe.contentWindow.postMessage({action: 'scrollTo', target: scrollTarget}, '*');
            });
        }
    }
}

// Game state initialization with default values
let coinCount = 0;
let coinsPerClick = 1;
let coinsPerSecond = 0;
let gpuCount = 0;
let lastGpuClick = Date.now();
let activeSpeechBubble = null;

// Initialize buildings and upgrades with default values if not already done
if (typeof buildings !== 'undefined') {
    buildings.forEach(building => {
        building.count = 0;
        building.productionMultiplier = 1;
    });
}

if (typeof upgrades !== 'undefined') {
    upgrades.forEach(upgrade => {
        upgrade.purchased = false;
        upgrade.unlocked = false;
    });
}

// Speichersystem
const SAVE_KEY = 'resselClickerSave';
const AUTOSAVE_INTERVAL = 30000; // Alle 30 Sekunden speichern

// GPU orbital elements
const gpus = [];
const BASE_ORBITAL_RADIUS_X = 160; // Horizontaler Radius
const BASE_ORBITAL_RADIUS_Y = 140; // Vertikaler Radius
const GPU_SIZE = 32;

// Cheat code system
let currentInput = '';
const CHEAT_CODE = 'motherlode';

// Event Listeners
resselImage.addEventListener('click', (event) => {
    handleClick(event);
});

// Neue Funktion für die Click-Logik
function handleClick(event) {
    const clickValue = getCurrentClickValue();
    coinCount += clickValue;
    updateCoinCount();
    createFloatingText(event, clickValue);
    createRippleEffect(event);
    animateResselClick();
    
    // 5% Chance auf einen Spruch
    if (Math.random() < 0.05 && clickQuotes.length > 0) {
        // Übergebe true für Click-Quote
        showSpeechBubble(clickQuotes[Math.floor(Math.random() * clickQuotes.length)], true);
    }
}

// Füge Leertasten-Event hinzu
document.addEventListener('keydown', (event) => {
    // Prüfe ob es die Leertaste ist und kein Textfeld fokussiert ist
    if (event.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        event.preventDefault(); // Verhindere Scrollen der Seite
        
        // Erstelle ein simuliertes Klick-Event an der Position des Ressel-Bildes
        const rect = resselImage.getBoundingClientRect();
        const simulatedEvent = {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
        };
        
        handleClick(simulatedEvent);
    }
    
    // Bestehende Cheat-Code Logik
    if (event.key.match(/^[a-zA-Z]$/)) {
        currentInput += event.key.toLowerCase();
        
        if (currentInput.length > CHEAT_CODE.length) {
            currentInput = currentInput.slice(-CHEAT_CODE.length);
        }
        
        if (currentInput === CHEAT_CODE) {
            const cheatButton = document.getElementById('cheat-button');
            if (cheatButton) {
                cheatButton.style.display = 'block';
                cheatButton.classList.add('animate-bounce');
                setTimeout(() => cheatButton.classList.remove('animate-bounce'), 1000);
                
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 crypto-card p-4 z-50 animate-slide-in';
                notification.innerHTML = `
                    <div class="text-emerald-400 font-bold mb-2">Cheat Code aktiviert!</div>
                    <div class="text-gray-300">
                        Der Dev-Cheat wurde freigeschaltet.
                    </div>
                `;
                
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.classList.add('animate-fade-out');
                    setTimeout(() => notification.remove(), 500);
                }, 3000);
            }
            currentInput = '';
        }
    }
});

// Separate update intervals
const UPDATE_INTERVALS = {
    FAST: 50,      // 50ms for coin count and essential updates
    MEDIUM: 1000,  // 1s for production calculations
    SLOW: 5000     // 5s for shop and building renders
};

// Game Loop
let lastShopUpdate = 0;
let lastProductionUpdate = 0;

function gameLoop(timestamp) {
    // Fast updates (coin count, etc.)
    updateCoinDisplay();
    
    // Medium updates (production calculations)
    if (!lastProductionUpdate || timestamp - lastProductionUpdate >= UPDATE_INTERVALS.MEDIUM) {
        if (coinsPerSecond > 0) {
            coinCount += coinsPerSecond;
        }
        lastProductionUpdate = timestamp;
    }
    
    // Slow updates (shop rendering)
    if (!lastShopUpdate || timestamp - lastShopUpdate >= UPDATE_INTERVALS.SLOW) {
        updateBuildingButtons();
        checkUpgradeUnlocks();
        renderBuildings();
        lastShopUpdate = timestamp;
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

// Update only the coin display
function updateCoinDisplay() {
    if (coinCountElement) {
        const formattedCount = (typeof coinCount === 'number') ? Math.floor(coinCount).toLocaleString() : '0';
        coinCountElement.textContent = formattedCount;
    }
}

// Modify the updateCoinCount function to be less aggressive
function updateCoinCount() {
    updateCoinDisplay();
    updateCoinsPerClickDisplay();
    updateCoinsPerSecondDisplay();
    saveGame();
}

// Remove the old interval
// setInterval(() => {
//     if (coinsPerSecond > 0) {
//         coinCount += coinsPerSecond;
//         updateCoinCount();
//     }
// }, 1000);

// --- Functions ---
function calculateBuildingCost(mitarbeiter) {
    const multiplier = mitarbeiter.costMultiplier || 1.15; // Verwende individuellen Multiplikator falls vorhanden, sonst 1.15
    return Math.ceil(mitarbeiter.baseCost * Math.pow(multiplier, mitarbeiter.count));
}

function calculateBuildingProduction(building) {
    // Berechne Basis-Produktion
    let production = building.baseProduction * building.productionMultiplier;
    
    // Wende GPU-Synergien an, aber nicht auf GPUs selbst
    if (building.id !== 'gpu') {
        const synergies = calculateGPUSynergies();
        production *= synergies.productionMultiplier;
    }
    
    // Multipliziere mit der Anzahl der Gebäude
    return production * building.count;
}

function updateTotalProduction() {
    const synergies = calculateGPUSynergies();
    
    coinsPerSecond = buildings.reduce((total, building) => {
        // Skip GPUs as they only produce through clicks
        if (building.id === 'gpu') return total;
        
        // Berechne die Basisproduktion
        let production = building.baseProduction * building.productionMultiplier * building.count;
        
        // Wende GPU-Synergie-Multiplikator an
        production *= synergies.productionMultiplier;
        
        return total + production;
    }, 0);
    
    updateCoinsPerSecondDisplay();
}

// --- GPU System ---
function createGPU() {
    const gpu = document.createElement('div');
    gpu.className = 'gpu';
    gpu.style.width = `${GPU_SIZE}px`;
    gpu.style.height = `${GPU_SIZE}px`;
    
    // Zufällige Startposition und individuelle Variation
    const angle = Math.random() * Math.PI * 2;
    const radiusVariation = 0.9 + Math.random() * 0.2; // 90% bis 110% des Basis-Radius
    const verticalShift = (Math.random() - 0.5) * 20; // Vertikale Verschiebung
    
    gpu.dataset.angle = angle;
    gpu.dataset.speed = 0.001 + Math.random() * 0.001;
    gpu.dataset.radiusVariation = radiusVariation;
    gpu.dataset.verticalShift = verticalShift;
    gpu.dataset.wobblePhase = Math.random() * Math.PI * 2; // Zufällige Startphase für Wobble
    gpu.dataset.wobbleSpeed = 0.002 + Math.random() * 0.002; // Individuelle Wobble-Geschwindigkeit
    
    updateGPUPosition(gpu);
    resselImage.parentElement.appendChild(gpu);
    gpus.push(gpu);
}

function updateGPUPosition(gpu) {
    const angle = parseFloat(gpu.dataset.angle);
    const radiusVariation = parseFloat(gpu.dataset.radiusVariation);
    const verticalShift = parseFloat(gpu.dataset.verticalShift);
    const wobblePhase = parseFloat(gpu.dataset.wobblePhase);
    
    // Berechne Basis-Position auf der Ellipse
    let x = Math.cos(angle) * BASE_ORBITAL_RADIUS_X * radiusVariation;
    let y = Math.sin(angle) * BASE_ORBITAL_RADIUS_Y * radiusVariation;
    
    // Füge Wobble-Effekt hinzu
    const wobbleAmount = 10;
    const wobbleOffset = Math.sin(wobblePhase) * wobbleAmount;
    
    // Modifiziere die Position basierend auf dem Winkel
    // Dies erzeugt eine mehr "Ressel-förmige" Bahn
    if (angle > Math.PI / 2 && angle < Math.PI * 3/2) {
        // Untere Hälfte: etwas enger
        x *= 0.85;
        y *= 0.9;
    } else {
        // Obere Hälfte: etwas breiter
        x *= 1.1;
        y *= 0.95;
    }
    
    // Füge vertikale Verschiebung und Wobble hinzu
    y += verticalShift + wobbleOffset;
    
    // Berechne Rotation basierend auf der Bewegungsrichtung
    const rotation = angle + Math.PI / 2; // 90 Grad zusätzlich für korrekte Ausrichtung
    
    gpu.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}rad)`;
}

// Calculate current GPU click interval based on upgrades
function getCurrentGPUInterval() {
    let interval = 10000; // Default 10 seconds
    
    // Check for RTX upgrade
    const rtxUpgrade = upgrades.find(u => u.id === 'gpu_efficiency1');
    if (rtxUpgrade && rtxUpgrade.purchased) {
        interval = 8000;
    }
    
    // Check for Quantum upgrade (requires RTX)
    const quantumUpgrade = upgrades.find(u => u.id === 'gpu_efficiency2');
    if (quantumUpgrade && quantumUpgrade.purchased) {
        interval = 6000;
    }
    
    return interval;
}

function updateGPUs(timestamp) {
    gpus.forEach(gpu => {
        const angle = parseFloat(gpu.dataset.angle);
        const speed = parseFloat(gpu.dataset.speed);
        const wobblePhase = parseFloat(gpu.dataset.wobblePhase);
        const wobbleSpeed = parseFloat(gpu.dataset.wobbleSpeed);
        
        // Update Winkel und Wobble-Phase
        gpu.dataset.angle = (angle + speed) % (Math.PI * 2);
        gpu.dataset.wobblePhase = (wobblePhase + wobbleSpeed) % (Math.PI * 2);
        
        updateGPUPosition(gpu);
    });

    // GPU clicks
    const gpuBuilding = buildings.find(b => b.id === 'gpu');
    if (gpuBuilding.count > 0 && Date.now() - lastGpuClick >= getCurrentGPUInterval()) {
        // Calculate click value with synergies
        const synergies = calculateGPUSynergies();
        const clickValueWithSynergies = getCurrentClickValue();
        const totalClicks = gpuBuilding.count * clickValueWithSynergies;
        
        coinCount += totalClicks;
        updateCoinCount();
        
        // Create a special floating text for GPU clicks
        const textElement = document.createElement('span');
        textElement.textContent = `+${totalClicks.toLocaleString()} (GPUs)`;
        textElement.classList.add('floating-text', 'text-emerald-400', 'font-bold', 'text-xl');
        
        const rect = resselImage.getBoundingClientRect();
        textElement.style.left = `${rect.width / 2}px`;
        textElement.style.top = `${-20}px`;
        
        resselImage.parentElement.appendChild(textElement);
        setTimeout(() => textElement.remove(), 1000);
        
        lastGpuClick = Date.now();
    }

    requestAnimationFrame(updateGPUs);
}

// --- Building and Upgrade Functions ---
function renderBuildings() {
    const buildingsContainer = document.getElementById('staff-container');  // Changed from 'buildings-container'
    if (!buildingsContainer) return;

    const synergies = calculateGPUSynergies();

    buildingsContainer.innerHTML = `
        <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
                <div class="flex items-center gap-2">
                    <i class="fas fa-users text-2xl text-emerald-400"></i>
                    <h3 class="text-xl font-bold text-emerald-400">Mitarbeiter einstellen</h3>
                </div>
                <div class="h-px flex-grow bg-gradient-to-r from-emerald-400/50 to-transparent"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                ${buildings.map(building => {
                    const cost = calculateBuildingCost(building);
                    const canAfford = coinCount >= cost;
                    
                    // Spezielle Anzeige für GPUs
                    let productionInfo = '';
                    if (building.id === 'gpu') {
                        const interval = getCurrentGPUInterval() / 1000; // in Sekunden
                        const clicksPerGPU = getCurrentClickValue();
                        const totalClickValue = building.count * clicksPerGPU;
                        const rslPerSecond = totalClickValue / interval; // RSL pro Sekunde
                        
                        productionInfo = `
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Intervall:</span>
                                <span class="${!canAfford ? 'text-red-400' : 'text-teal-400'} font-medium">${interval} Sek.</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Gesamt/Klick:</span>
                                <span class="${!canAfford ? 'text-red-400' : 'text-teal-400'} font-medium">+${formatNumber(totalClickValue)} RSL</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Effektiv:</span>
                                <span class="${!canAfford ? 'text-red-400' : 'text-teal-400'} font-medium">+${formatNumber(rslPerSecond)}/s</span>
                            </div>
                        `;
                    } else {
                        const totalProduction = calculateBuildingProduction(building);
                        let singleProduction = building.baseProduction * building.productionMultiplier;
                        singleProduction *= synergies.productionMultiplier;
                        
                        productionInfo = `
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Pro Stück:</span>
                                <span class="${!canAfford ? 'text-red-400' : 'text-teal-400'} font-medium">+${formatNumber(singleProduction)}/s</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Gesamt:</span>
                                <span class="${!canAfford ? 'text-red-400' : 'text-teal-400'} font-medium">+${formatNumber(totalProduction)}/s</span>
                            </div>
                        `;
                    }
                    
                    return `
                        <button id="building-${building.id}" 
                                class="crypto-card flex flex-col p-3 transition-all duration-200 relative group
                                       ${!canAfford ? 'opacity-50 border border-red-500/30' : 'hover:scale-102 hover:shadow-lg hover:shadow-emerald-500/20'}"
                                ${!canAfford ? 'disabled' : ''}>
                            <div class="flex items-center gap-2 mb-2">
                                <div class="w-8 h-8 rounded-lg bg-gradient-to-br ${!canAfford ? 'from-red-400 to-red-600' : 'from-emerald-400 to-teal-600'} flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-${building.icon} text-sm text-white"></i>
                                </div>
                                <span class="font-bold ${!canAfford ? 'text-red-400' : 'text-emerald-400'} truncate text-sm">${building.name}</span>
                            </div>
                            <div class="flex flex-col gap-1 text-xs">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-400">Anzahl:</span>
                                    <span class="text-gray-300 font-medium">${building.count}</span>
                                </div>
                                ${productionInfo}
                            </div>
                            <div class="mt-2 flex justify-end">
                                <div class="inline-flex items-center gap-1 px-2 py-1 rounded-full ${!canAfford ? 'bg-red-500/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'} text-xs font-medium">
                                    <i class="fas fa-coins text-xs"></i>
                                    ${formatNumber(cost)} RSL
                                </div>
                            </div>
                            ${!canAfford ? `
                                <div class="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    Zu teuer
                                </div>
                            ` : ''}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // Render efficiency upgrades
    const upgradesContainer = document.getElementById('upgrades');
    upgradesContainer.innerHTML = '';

    // Gruppiere Upgrades nach Typ, aber nur nicht gekaufte
    const groupedUpgrades = {
        click: upgrades.filter(u => u.type === 'click' && !u.purchased),
        gpu: upgrades.filter(u => u.category === 'gpu' && !u.purchased),
        mitarbeiter: upgrades.filter(u => u.category === 'mitarbeiter' && !u.purchased),
        synergy: upgrades.filter(u => u.category === 'synergy' && !u.purchased)
    };

    // Erstelle Container für Building-Upgrades
    if (groupedUpgrades.gpu.length > 0 || groupedUpgrades.mitarbeiter.length > 0 || groupedUpgrades.synergy.length > 0) {
        const buildingSection = document.createElement('div');
        buildingSection.className = 'mb-8';
        buildingSection.innerHTML = `
            <div class="flex items-center gap-3 mb-4">
                <div class="flex items-center gap-2">
                    <i class="fas fa-chart-line text-2xl text-purple-400"></i>
                    <h3 class="text-xl font-bold text-purple-400">Effizienz-Upgrades</h3>
                </div>
                <div class="h-px flex-grow bg-gradient-to-r from-purple-400/50 to-transparent"></div>
            </div>
            <div class="space-y-6">
                ${groupedUpgrades.gpu.length > 0 ? `
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <i class="fas fa-microchip text-lg text-purple-400/75"></i>
                            <h4 class="text-lg font-semibold text-purple-400/75">GPU-Upgrades</h4>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${groupedUpgrades.gpu.map(upgrade => createUpgradeElement(upgrade)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${groupedUpgrades.mitarbeiter.length > 0 ? `
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <i class="fas fa-users text-lg text-purple-400/75"></i>
                            <h4 class="text-lg font-semibold text-purple-400/75">Mitarbeiter-Upgrades</h4>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${groupedUpgrades.mitarbeiter.map(upgrade => createUpgradeElement(upgrade)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${groupedUpgrades.synergy.length > 0 ? `
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <i class="fas fa-arrows-spin text-lg text-purple-400/75"></i>
                            <h4 class="text-lg font-semibold text-purple-400/75">Synergie-Upgrades</h4>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${groupedUpgrades.synergy.map(upgrade => createUpgradeElement(upgrade)).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        upgradesContainer.appendChild(buildingSection);
    }

    // Erstelle Container für Click-Upgrades (Ränge)
    if (groupedUpgrades.click.length > 0) {
        const clickSection = document.createElement('div');
        clickSection.className = 'mb-8';
        clickSection.innerHTML = `
            <div class="flex items-center gap-3 mb-4">
                <div class="flex items-center gap-2">
                    <i class="fas fa-crown text-2xl text-amber-400"></i>
                    <h3 class="text-xl font-bold text-amber-400">Rang-Upgrades</h3>
                </div>
                <div class="h-px flex-grow bg-gradient-to-r from-amber-400/50 to-transparent"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${groupedUpgrades.click.map(upgrade => {
                    const isPurchased = upgrade.purchased;
                    const isLocked = !upgrade.unlocked;
                    const canAfford = coinCount >= upgrade.cost;
                    
                    return `
                        <button id="upgrade-${upgrade.id}"
                                class="crypto-card flex flex-col gap-2 p-3 transition-all duration-200 relative group text-left
                                       ${isPurchased ? 'opacity-50' : ''}
                                       ${isLocked ? 'opacity-75 grayscale' : ''}
                                       ${!isPurchased && !isLocked && !canAfford ? 'opacity-50 border border-red-500/30' : ''}
                                       ${!isPurchased && !isLocked && canAfford ? 'hover:scale-102 hover:shadow-lg hover:shadow-amber-500/20' : ''}"
                                ${(coinCount < upgrade.cost || isLocked || isPurchased) ? 'disabled' : ''}>
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg bg-gradient-to-br ${!isPurchased && !isLocked && !canAfford ? 'from-red-400 to-red-600' : 'from-amber-400 to-orange-600'} flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-${upgrade.icon} text-white"></i>
                                </div>
                                <div class="flex-grow min-w-0">
                                    <div class="flex justify-between items-center gap-2">
                                        <span class="font-bold ${!isPurchased && !isLocked && !canAfford ? 'text-red-400' : 'text-amber-400'} truncate">${upgrade.name}</span>
                                        ${isPurchased ? 
                                            '<div class="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-medium">Gekauft</div>' : 
                                            `<div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${!canAfford ? 'bg-red-500/10 text-red-400' : 'bg-amber-400/10 text-amber-400'} text-xs font-medium whitespace-nowrap">
                                                <i class="fas fa-coins text-xs"></i>
                                                ${formatNumber(upgrade.cost)} RSL
                                            </div>`
                                        }
                                    </div>
                                </div>
                            </div>
                            <p class="text-gray-400 text-sm text-left">${upgrade.tooltip.description}</p>
                            ${!isPurchased && !isLocked ? `
                                <div class="text-xs text-amber-400 bg-amber-400/5 px-2 py-1 rounded-lg mt-1">
                                    <i class="fas fa-chart-line mr-1 opacity-50"></i>
                                    +${formatNumber(upgrade.multiplier - coinsPerClick)} RSL pro Klick
                                </div>
                            ` : ''}
                            ${isLocked ? `
                                <div class="text-xs text-red-400 bg-red-400/5 px-2 py-1 rounded-lg mt-1">
                                    <i class="fas fa-lock-open mr-1 opacity-50"></i>
                                    ${upgrade.tooltip.requirement}
                                </div>
                            ` : ''}
                            ${!isPurchased && !isLocked && !canAfford ? `
                                <div class="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    Zu teuer
                                </div>
                            ` : ''}
                        </button>
                    `;
                }).join('')}
            </div>
        `;
        upgradesContainer.appendChild(clickSection);
    }

    // Füge Event Listener und Tooltips hinzu
    buildings.forEach(building => {
        const button = document.getElementById(`building-${building.id}`);
        if (!button) return;

        // Event Listener
        button.addEventListener('click', () => buyBuilding(building.id));

        // Tooltip
        const cost = calculateBuildingCost(building);
        let tooltipContent;
        
        if (building.id === 'gpu') {
            const interval = getCurrentGPUInterval() / 1000;
            const clickValue = getCurrentClickValue();
            tooltipContent = `
                <div>
                    <div class="tooltip-title">${building.tooltip.title}</div>
                    <div class="tooltip-description">${building.tooltip.description}</div>
                    <div class="tooltip-stats">
                        Aktueller Besitz: ${building.count}<br>
                        Klick-Intervall: ${interval} Sekunden<br>
                        Klick-Stärke: ${formatNumber(clickValue)} RSL<br>
                        Nächste kostet: ${formatNumber(cost)} RSL
                    </div>
                </div>
            `;
        } else {
            const production = calculateBuildingProduction(building);
            tooltipContent = `
                <div>
                    <div class="tooltip-title">${building.tooltip.title}</div>
                    <div class="tooltip-description">${building.tooltip.description}</div>
                    <div class="tooltip-stats">
                        Aktueller Besitz: ${building.count}<br>
                        Produktion: ${formatNumber(production)} RSL/sec<br>
                        Nächste kostet: ${formatNumber(cost)} RSL
                    </div>
                </div>
            `;
        }

        tippy(button, {
            content: tooltipContent,
            allowHTML: true,
            theme: 'crypto',
            placement: 'bottom',
            duration: [200, 200],
            animation: 'fade',
            interactive: true,
            hideOnClick: false,
            trigger: 'mouseenter'
        });
    });

    // Füge Event Listener und Tooltips für Upgrades hinzu
    upgrades.forEach(upgrade => {
        const button = document.getElementById(`upgrade-${upgrade.id}`);
        if (!button) return;

        // Event Listener
        button.addEventListener('click', () => buyUpgrade(upgrade.id));

        let tooltipContent = `
            <div>
                <div class="tooltip-title">${upgrade.tooltip.title}</div>
                <div class="tooltip-description">${upgrade.tooltip.description}</div>
                <div class="tooltip-stats">
                    ${upgrade.tooltip.requirement}<br>
                    <div class="mt-2 text-purple-400">
                        Kosten: ${formatNumber(upgrade.cost)} RSL
                    </div>
                </div>
            </div>
        `;

        tippy(button, {
            content: tooltipContent,
            allowHTML: true,
            theme: 'crypto',
            placement: 'bottom',
            duration: [200, 200],
            animation: 'fade',
            interactive: true,
            hideOnClick: false,
            trigger: 'mouseenter'
        });
    });

    // Aktualisiere die gekauften Upgrades
    renderPurchasedUpgrades();
}

function buyBuilding(buildingId) {
    const building = buildings.find(b => b.id === buildingId);
    const cost = calculateBuildingCost(building);
    
    if (building && coinCount >= cost) {
        coinCount -= cost;
        building.count++;

        // Aktualisiere spezielle Building-Typen
        if (building.id === 'gpu') {
            createGPU();
        } else if (building.id === 'sgadmin') {
            updateSGAdmins();
        } else if (building.id === 'miningexpert') {  // Changed from 'miningrig'
            updateMiningExperts();
        } else if (building.id === 'datacenterleader') {  // Changed from 'datacenter'
            updateDatacenterLeaders();
        }

        updateTotalProduction();
        updateCoinCount();
        renderBuildings();
        checkUpgradeUnlocks();
        saveGame();
    }
}

function buyUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    
    if (upgrade && !upgrade.purchased && coinCount >= upgrade.cost) {
        coinCount -= upgrade.cost;
        upgrade.purchased = true;

        if (upgrade.type === 'click') {
            coinsPerClick = upgrade.multiplier;
            updateCoinsPerClickDisplay();
        } else if (upgrade.synergy) {
            updateTotalProduction();
        } else {
            const building = buildings.find(b => b.id === upgrade.requiredBuilding);
            if (building) {
                building.productionMultiplier *= upgrade.multiplier;
            }
        }

        updateTotalProduction();
        updateCoinCount();
        renderBuildings();
        checkUpgradeUnlocks();
        updateStatsText();
        saveGame();
        
        // Spiele eine Animation auf dem korrekten Container
        const purchasedContainer = document.getElementById('purchased-upgrades');
        if (purchasedContainer) {
            const targetContainer = upgrade.type === 'click' 
                ? purchasedContainer.querySelector('#rank-upgrades-container')
                : purchasedContainer.querySelector('#efficiency-upgrades-container');
                
            if (targetContainer) {
                const lastUpgrade = targetContainer.lastElementChild;
                if (lastUpgrade) {
                    lastUpgrade.classList.add('animate-bounce');
                    setTimeout(() => lastUpgrade.classList.remove('animate-bounce'), 1000);
                }
            }
        }
    }
}

function checkUpgradeUnlocks() {
    upgrades.forEach(upgrade => {
        if (!upgrade.purchased) {
            if (upgrade.type === 'click') {
                // Für Click-Upgrades prüfen, ob das vorherige Upgrade gekauft wurde
                if (upgrade.requires) {
                    const requiredUpgrade = upgrades.find(u => u.id === upgrade.requires);
                    upgrade.unlocked = requiredUpgrade && requiredUpgrade.purchased;
                } else {
                    upgrade.unlocked = true; // Erstes Click-Upgrade ist immer verfügbar
                }
            } else {
                // Für Building-Upgrades wie bisher
                const building = buildings.find(b => b.id === upgrade.requiredBuilding);
                upgrade.unlocked = building && building.count >= upgrade.requiredCount;
            }
        }
    });
    renderBuildings();
}

function updateBuildingButtons() {
    buildings.forEach(building => {
        const button = document.getElementById(`building-${building.id}`);
        if (button) {
            const cost = calculateBuildingCost(building);
            button.disabled = coinCount < cost;
            
            // Aktualisiere auch die visuelle Darstellung
            if (coinCount < cost) {
                button.classList.add('opacity-50');
            } else {
                button.classList.remove('opacity-50');
            }
        }
    });

    upgrades.forEach(upgrade => {
        if (!upgrade.purchased && upgrade.unlocked) {
        const button = document.getElementById(`upgrade-${upgrade.id}`);
        if (button) {
            button.disabled = coinCount < upgrade.cost;
            }
        }
    });
}

function updateCoinsPerSecondDisplay() {
    const cpsElement = document.getElementById('coins-per-second');
    if (cpsElement) {
        cpsElement.textContent = coinsPerSecond.toLocaleString();
    }
}

function createFloatingText(event, value) {
    const textElement = document.createElement('span');
    textElement.textContent = `+${Math.floor(value).toLocaleString()}`;
    textElement.classList.add('floating-text', 'text-emerald-400', 'font-bold', 'text-2xl');

    const rect = resselImage.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const randomX = (Math.random() - 0.5) * 40;
    textElement.style.left = `${x + randomX}px`;
    textElement.style.top = `${y - 20}px`;

    resselImage.parentElement.appendChild(textElement);

    setTimeout(() => {
        textElement.remove();
    }, 1000);
}

function createRippleEffect(event) {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    
    const rect = resselImage.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    resselImage.parentElement.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function animateResselClick() {
    resselImage.classList.add('clicked');
    setTimeout(() => {
        resselImage.classList.remove('clicked');
    }, 150);
}

// Start GPU animation system
requestAnimationFrame(updateGPUs);

// --- Initialization ---
function initializeGame() {
    if (!loadGame()) {
        // Wenn kein Spielstand gefunden wurde, starte mit Standardwerten
        updateCoinCount();
        renderBuildings();
        updateSGAdmins();
        updateMiningExperts();
        updateDatacenterLeaders();
        updateStatsText();
    } else {
        // Wenn Spielstand geladen wurde, aktualisiere die Anzeige
        updateCoinCount();
        renderBuildings();
        updateSGAdmins();
        updateMiningExperts();
        updateDatacenterLeaders();
        updateTotalProduction();
        updateStatsText();
    }
}

initializeGame();

// Neue Funktion für SG-Admins
function updateSGAdmins() {
    const adminsGrid = document.getElementById('sg-admins-grid');
    const adminsHeader = document.getElementById('sg-admins-header');
    const sgadmin = buildings.find(b => b.id === 'sgadmin');
    
    // Zeige/verstecke Header basierend auf der Anzahl
    adminsHeader.classList.toggle('hidden', sgadmin.count === 0);
    
    // Lösche bestehende Admins
    adminsGrid.innerHTML = '';
    
    // Array mit verfügbaren Admin-Sprites
    const adminSprites = ['images/sgadmin.png', 'images/sgadmin2.png', 'images/sgadmin3.png', 'images/sgadmin4.png', 
        'images/sgadmin5.png', 'images/sgadmin6.png', 'images/sgadmin7.png', 'images/sgadmin8.png', 'images/sgadmin9.png', 
        'images/sgadmin10.png', 'images/sgadmin11.png', 'images/sgadmin12.png', 'images/sgadmin13.png'];
    
    // Berechne den Abstand zwischen Admins basierend auf der Anzahl
    const containerWidth = adminsGrid.offsetWidth;
    const baseWidth = 96; // w-24 entspricht 96px
    const minGap = -48; // Maximale Überlappung in Pixeln
    const maxGap = 8; // Normaler Abstand wenn wenige Admins
    
    // Setze die Grid-Eigenschaften
    adminsGrid.style.display = 'flex';
    adminsGrid.style.flexDirection = 'column';
    adminsGrid.style.alignItems = 'center';
    adminsGrid.style.overflow = 'hidden';
    adminsGrid.style.padding = '1rem 0';
    adminsGrid.style.minHeight = '180px';
    
    const totalAdmins = sgadmin.count;
    const rowSize = 15; // Admins pro Reihe
    const numRows = Math.ceil(totalAdmins / rowSize);
    
    // Erstelle die Reihen
    const rows = [];
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'center';
        row.style.flexWrap = 'nowrap';
        row.style.position = 'relative';
        row.style.zIndex = rowIndex + 1; // Jede neue Reihe kommt nach vorne
        
        // Einheitliche Überlappung für alle Reihen nach der ersten
        if (rowIndex > 0) {
            row.style.marginTop = '-70px'; // Konstante Überlappung für alle Reihen
        }
        
        rows.push(row);
    }
    
    // Verteile die Admins auf die Reihen
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const startIndex = rowIndex * rowSize;
        const endIndex = Math.min(startIndex + rowSize, totalAdmins);
        const adminsInThisRow = endIndex - startIndex;
        
        // Berechne den Abstand für diese Reihe
        const rowGap = Math.min(maxGap, Math.max(minGap, (containerWidth - (adminsInThisRow * baseWidth)) / (adminsInThisRow - 1 || 1)));
        
        // Füge Admins zur Reihe hinzu
        for (let i = startIndex; i < endIndex; i++) {
            const isFirstInRow = i === startIndex;
            const adminImg = createAdminSprite(i, adminSprites, isFirstInRow ? '0' : `${rowGap}px`);
            rows[rowIndex].appendChild(adminImg);
        }
    }
    
    // Füge alle Reihen zum Grid hinzu
    rows.forEach(row => adminsGrid.appendChild(row));
    
    // Starte die Animationen
    startRandomBounces();
    startBinaryAnimation();
}

// Hilfsfunktion zum Erstellen eines Admin-Sprites
function createAdminSprite(index, sprites, marginLeft) {
    const adminImg = document.createElement('div');
    adminImg.className = 'relative group flex-shrink-0';
    adminImg.style.marginLeft = marginLeft;
    
    const spriteIndex = index % sprites.length;
    adminImg.innerHTML = `
        <div class="relative">
            <img src="${sprites[spriteIndex]}" 
                 alt="SG-Admin" 
                 class="w-24 h-28 object-contain transition-all duration-300 hover:scale-105 hover:rotate-2 admin-sprite hover:z-10"
                 style="filter: drop-shadow(0 0 12px rgba(45, 212, 191, 0.3));">
            <img src="images/pc.png"
                 alt="PC"
                 class="absolute top-0 left-[-8px] w-24 h-28 object-contain pc-sprite"
                 style="filter: drop-shadow(0 0 8px rgba(45, 212, 191, 0.2));">
        </div>
    `;
    
    return adminImg;
}

// Funktion für die Binary-Animation
function startBinaryAnimation() {
    // Stoppe vorheriges Intervall falls vorhanden
    if (window.binaryInterval) {
        clearInterval(window.binaryInterval);
    }

    window.binaryInterval = setInterval(() => {
        // Getrennte Behandlung für PCs, Server und Leader
        const pcs = document.querySelectorAll('.pc-sprite');
        const servers = document.querySelectorAll('.server-sprite');
        const leaders = document.querySelectorAll('.leader-sprite');

        // Funktion zum Erstellen von Binärzahlen für eine Sprite-Gruppe
        const createBinaryBits = (sprites, count) => {
            // Berechne die Anzahl der Binärzahlen basierend auf der Anzahl der Sprites
            const numFloaters = Math.max(1, Math.floor(count * 0.3)); // 30% der Sprites, mindestens 1
            
            for (let i = 0; i < numFloaters; i++) {
                const randomSprite = sprites[Math.floor(Math.random() * sprites.length)];
                if (!randomSprite) continue;

                const spriteRect = randomSprite.getBoundingClientRect();
                const bit = document.createElement('div');
                bit.className = 'binary-bit';
                bit.textContent = Math.random() < 0.5 ? '0' : '1';

                // Zufällige Startposition innerhalb des Sprites
                const startX = Math.random() * spriteRect.width;
                const startY = Math.random() * (spriteRect.height / 2); // Nur obere Hälfte

                // Zufällige Float-Richtung
                const floatX = (Math.random() - 0.5) * 30;
                bit.style.setProperty('--float-x', `${floatX}px`);

                // Positioniere das Bit
                bit.style.left = `${startX}px`;
                bit.style.top = `${startY}px`;

                // Füge das Bit zum Sprite-Container hinzu
                randomSprite.parentElement.appendChild(bit);

                // Entferne das Bit nach der Animation
                setTimeout(() => bit.remove(), 1500);
            }
        };

        // Erstelle Binärzahlen für alle Gruppen
        if (pcs.length > 0) createBinaryBits(pcs, pcs.length);
        if (servers.length > 0) createBinaryBits(servers, servers.length);
        if (leaders.length > 0) createBinaryBits(leaders, leaders.length * 2); // Doppelte Binärzahlen für Leader

    }, 300); // Häufigere Erzeugung von Bits
}

// Funktion für zufällige Hüpfer
function startRandomBounces() {
    // Stoppe vorherige Intervalle, falls vorhanden
    if (window.bounceIntervalAdmins) {
        clearInterval(window.bounceIntervalAdmins);
    }
    if (window.bounceIntervalExperts) {
        clearInterval(window.bounceIntervalExperts);
    }
    if (window.bounceIntervalLeaders) {
        clearInterval(window.bounceIntervalLeaders);
    }

    // Separate Animation für SG-Admins
    window.bounceIntervalAdmins = setInterval(() => {
        const adminSprites = document.querySelectorAll('#sg-admins-grid .admin-sprite');
        if (adminSprites.length === 0) return;

        // Zufällige Anzahl von Admins (1-4) zum Hüpfen auswählen
        const numBouncers = Math.floor(Math.random() * 4) + 1;

        // Wähle zufällige Admins aus
        for (let i = 0; i < numBouncers; i++) {
            const randomIndex = Math.floor(Math.random() * adminSprites.length);
            const admin = adminSprites[randomIndex];
            
            // Nur hinzufügen, wenn der Admin nicht bereits springt
            if (!admin.classList.contains('admin-bounce')) {
                admin.classList.add('admin-bounce');
                
                // Binärzahlen-Animation hinzufügen
                const rect = admin.getBoundingClientRect();
                const binaryBit = document.createElement('div');
                binaryBit.className = 'binary-bit';
                binaryBit.textContent = Math.random() < 0.5 ? '0' : '1';
                binaryBit.style.setProperty('--float-x', `${(Math.random() * 40 - 20)}px`);
                binaryBit.style.left = `${rect.left + rect.width / 2}px`;
                binaryBit.style.top = `${rect.top + rect.height / 2}px`;
                document.body.appendChild(binaryBit);
                
                // Zufällige Verzögerung für das Entfernen der Animation (300-700ms)
                const removeDelay = 300 + Math.random() * 400;
                setTimeout(() => {
                    admin.classList.remove('admin-bounce');
                }, removeDelay);
                
                // Binärzahl nach Animation entfernen
                setTimeout(() => {
                    binaryBit.remove();
                }, 1500);
            }
        }
    }, 800); // Häufigere Überprüfung für neue Hüpfer

    // Separate Animation für Mining-Experten
    window.bounceIntervalExperts = setInterval(() => {
        const expertSprites = document.querySelectorAll('#mining-experts-grid .expert-sprite');
        if (expertSprites.length === 0) return;

        // Zufällige Anzahl von Experten (1-4) zum Hüpfen auswählen
        const numBouncers = Math.floor(Math.random() * 4) + 1;

        // Wähle zufällige Experten aus
        for (let i = 0; i < numBouncers; i++) {
            const randomIndex = Math.floor(Math.random() * expertSprites.length);
            const expert = expertSprites[randomIndex];
            
            // Nur hinzufügen, wenn der Experte nicht bereits springt
            if (!expert.classList.contains('admin-bounce')) {
                expert.classList.add('admin-bounce');
                
                // Binärzahlen-Animation hinzufügen
                const rect = expert.getBoundingClientRect();
                const binaryBit = document.createElement('div');
                binaryBit.className = 'binary-bit';
                binaryBit.textContent = Math.random() < 0.5 ? '0' : '1';
                binaryBit.style.setProperty('--float-x', `${(Math.random() * 40 - 20)}px`);
                binaryBit.style.left = `${rect.left + rect.width / 2}px`;
                binaryBit.style.top = `${rect.top + rect.height / 2}px`;
                document.body.appendChild(binaryBit);
                
                // Zufällige Verzögerung für das Entfernen der Animation (300-700ms)
                const removeDelay = 300 + Math.random() * 400;
                setTimeout(() => {
                    expert.classList.remove('admin-bounce');
                }, removeDelay);
                
                // Binärzahl nach Animation entfernen
                setTimeout(() => {
                    binaryBit.remove();
                }, 1500);
            }
        }
    }, 800); // Häufigere Überprüfung für neue Hüpfer

    // Separate Animation für Rechenzentrumsleiter
    window.bounceIntervalLeaders = setInterval(() => {
        const leaderSprites = document.querySelectorAll('#datacenter-leaders-grid .leader-sprite');
        if (leaderSprites.length === 0) return;

        // Zufällige Anzahl von Leitern (1-4) zum Hüpfen auswählen
        const numBouncers = Math.floor(Math.random() * 4) + 1;

        // Wähle zufällige Leiter aus
        for (let i = 0; i < numBouncers; i++) {
            const randomIndex = Math.floor(Math.random() * leaderSprites.length);
            const leader = leaderSprites[randomIndex];
            
            // Nur hinzufügen, wenn der Leiter nicht bereits springt
            if (!leader.classList.contains('admin-bounce')) {
                leader.classList.add('admin-bounce');
                
                // Binärzahlen-Animation hinzufügen
                const rect = leader.getBoundingClientRect();
                const binaryBit = document.createElement('div');
                binaryBit.className = 'binary-bit';
                binaryBit.textContent = Math.random() < 0.5 ? '0' : '1';
                binaryBit.style.setProperty('--float-x', `${(Math.random() * 40 - 20)}px`);
                binaryBit.style.left = `${rect.left + rect.width / 2}px`;
                binaryBit.style.top = `${rect.top + rect.height / 2}px`;
                document.body.appendChild(binaryBit);
                
                // Zufällige Verzögerung für das Entfernen der Animation (300-700ms)
                const removeDelay = 300 + Math.random() * 400;
                setTimeout(() => {
                    leader.classList.remove('admin-bounce');
                }, removeDelay);
                
                // Binärzahl nach Animation entfernen
                setTimeout(() => {
                    binaryBit.remove();
                }, 1500);
            }
        }
    }, 800); // Häufigere Überprüfung für neue Hüpfer
}

function saveGame() {
    const saveData = {
        coinCount,
        coinsPerClick,
        coinsPerSecond,
        gpuCount,
        lastSave: Date.now(),
        createdAt: localStorage.getItem(SAVE_KEY) ? JSON.parse(localStorage.getItem(SAVE_KEY)).createdAt : Date.now(),
        staff: buildings.map(b => ({  // Changed from 'buildings' to 'staff'
            id: b.id,
            count: b.count,
            productionMultiplier: b.productionMultiplier
        })),
        upgrades: upgrades.map(u => ({
            id: u.id,
            purchased: u.purchased,
            unlocked: u.unlocked
        }))
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function getCurrentRank() {
    const clickUpgrades = upgrades.filter(u => u.type === 'click' && u.purchased);
    return clickUpgrades.length === 0 ? "armer Hurakrüppel" : clickUpgrades[clickUpgrades.length - 1].name;
}

// In der updateStatsText Funktion, ändere die Farbe des Rang-Bereichs
function updateStatsText() {
    const statsTextElement = document.getElementById('stats-text');
    if (!statsTextElement) return;

    // Ensure we have a save or create initial save data
    let save = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    if (!save.createdAt) {
        save.createdAt = Date.now();
        localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    }

    const createdAt = new Date(save.createdAt);
    const dateStr = createdAt.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
    const timeStr = createdAt.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const currentRank = getCurrentRank();

    statsTextElement.innerHTML = `
        <div class="grid grid-cols-2 gap-3">
            <div class="crypto-card p-4">
                <div class="flex items-center gap-2 mb-2">
                    <i class="fas fa-clock text-emerald-400"></i>
                    <h3 class="font-bold text-emerald-400">Mining-Start</h3>
                </div>
                <p class="text-sm text-gray-300 leading-relaxed">
                    Deine Arbeit begann am <span class="text-emerald-400 font-medium">${dateStr}</span> um <span class="text-emerald-400 font-medium">${timeStr}</span> Uhr.
                </p>
            </div>
            <div class="crypto-card p-4">
                <div class="flex items-center gap-2 mb-2">
                    <i class="fas fa-crown text-amber-400"></i>
                    <h3 class="font-bold text-amber-400">Aktueller Rang</h3>
                </div>
                <p class="text-sm text-gray-300 leading-relaxed">
                    Du bist derzeit <span class="text-amber-400 font-semibold">${currentRank}</span>.
                </p>
            </div>
        </div>
    `;
}

function loadGame() {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return false;
    
    try {
        const save = JSON.parse(savedData);
        
        // Validate save data structure
        if (!save || typeof save !== 'object') {
            console.error('Invalid save data structure');
            return false;
        }
        
        // Lade Grundwerte mit Fallback zu Standardwerten
        coinCount = save.coinCount || 0;
        coinsPerClick = save.coinsPerClick || 1;
        coinsPerSecond = save.coinsPerSecond || 0;
        gpuCount = save.gpuCount || 0;
        
        // Zeige Willkommensnachricht ohne Offline-Fortschritt
        const offlineTime = Math.floor((Date.now() - (save.lastSave || Date.now())) / 1000);
        if (offlineTime > 300) { // Nur anzeigen wenn mehr als 5 Minuten offline
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 crypto-card p-4 z-50 animate-slide-in';
                notification.innerHTML = `
                    <div class="text-emerald-400 font-bold mb-2">Willkommen zurück!</div>
                    <div class="text-gray-300">
                        Deine Miner haben auf dich gewartet! Zeit, wieder aktiv RSL zu schürfen!
                    </div>
                `;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.classList.add('animate-fade-out');
                    setTimeout(() => notification.remove(), 500);
                }, 5000);
            }, 1000);
        }
        
        // Lade Buildings/Staff mit Fehlerprüfung
        // Unterstütze sowohl altes (buildings) als auch neues (staff) Format
        const savedStaff = save.staff || save.buildings;
        if (Array.isArray(savedStaff) && typeof buildings !== 'undefined') {
            savedStaff.forEach(savedMember => {
                const member = buildings.find(b => b.id === savedMember.id);
                if (member) {
                    member.count = savedMember.count || 0;
                    member.productionMultiplier = savedMember.productionMultiplier || 1;
                    
                    // Initialisiere spezielle Building-Typen
                    if (member.id === 'gpu' && member.count > 0) {
                        for (let i = 0; i < member.count; i++) {
                            createGPU();
                        }
                    }
                }
            });
        }
        
        // Lade Upgrades mit Fehlerprüfung
        if (Array.isArray(save.upgrades) && typeof upgrades !== 'undefined') {
            save.upgrades.forEach(savedUpgrade => {
                const upgrade = upgrades.find(u => u.id === savedUpgrade.id);
                if (upgrade) {
                    upgrade.purchased = savedUpgrade.purchased || false;
                    upgrade.unlocked = savedUpgrade.unlocked || false;
                }
            });
        }

        // Aktualisiere die Anzeige
        updateCoinCount();
        renderBuildings();
        updateSGAdmins();
        updateMiningExperts();
        updateDatacenterLeaders();
        updateTotalProduction();
        updateStatsText();
        
        return true;
    } catch (error) {
        console.error('Fehler beim Laden des Spielstands:', error);
        // Reset to default values on error
        coinCount = 0;
        coinsPerClick = 1;
        coinsPerSecond = 0;
        gpuCount = 0;
        
        if (typeof buildings !== 'undefined') {
            buildings.forEach(building => {
                building.count = 0;
                building.productionMultiplier = 1;
            });
        }
        
        if (typeof upgrades !== 'undefined') {
            upgrades.forEach(upgrade => {
                upgrade.purchased = false;
                upgrade.unlocked = false;
            });
        }
        
        return false;
    }
}

// Füge CSS für Animationen hinzu
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    .animate-slide-in {
        animation: slideIn 0.3s ease-out forwards;
    }
    .animate-fade-out {
        animation: fadeOut 0.5s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Autosave Timer
setInterval(saveGame, AUTOSAVE_INTERVAL);

// Save beim Verlassen der Seite
window.addEventListener('beforeunload', () => {
    saveGame();
});

// Neue Funktion für das Aktualisieren der Klick-Anzeige
function getCurrentClickValue() {
    const synergies = calculateGPUSynergies();
    return coinsPerClick * synergies.clickMultiplier;
}

function updateCoinsPerClickDisplay() {
    const cpcElement = document.getElementById('coins-per-click');
    if (cpcElement) {
        cpcElement.textContent = formatNumber(getCurrentClickValue());
    }
}

// Reset Game Funktion
function resetGame() {
    if (confirm('Bist du sicher, dass du deinen Spielstand zurücksetzen möchtest? Diese Aktion kann nicht rückgängig gemacht werden!')) {
        // Lösche den Spielstand aus dem LocalStorage
        localStorage.removeItem(SAVE_KEY);
        
        // Setze alle Spielvariablen zurück
        coinCount = 0;
        coinsPerClick = 1;
        coinsPerSecond = 0;
        
        // Setze alle Buildings zurück
        buildings.forEach(building => {
            building.count = 0;
            building.productionMultiplier = 1;
        });
        
        // Setze alle Upgrades zurück
        upgrades.forEach(upgrade => {
            upgrade.purchased = false;
            upgrade.unlocked = false;
        });
        
        // Aktualisiere die Anzeige
        updateCoinCount();
        updateTotalProduction();
        renderBuildings();
        updateSGAdmins();
        updateMiningExperts();
        updateDatacenterLeaders();
        checkUpgradeUnlocks();
        
        // Zeige Bestätigung
        alert('Spielstand wurde erfolgreich zurückgesetzt!');
    }
}

// Event Listener für den Reset Button
document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.getElementById('reset-game');
    if (resetButton) {
        resetButton.addEventListener('click', resetGame);
    }
    
    // ... existing DOMContentLoaded code ...
    updateStatsText();
});

function renderUpgrades() {
    const upgradesContainer = document.getElementById('upgrades');
    if (!upgradesContainer) return;

    // Erstelle separate Container für Click- und Building-Upgrades
    let clickUpgradesHTML = '';
    let buildingUpgradesHTML = '';

    // Rendere Click-Upgrades
    const clickUpgrades = upgrades.filter(upgrade => upgrade.type === 'click' && upgrade.unlocked);
    if (clickUpgrades.length > 0) {
        clickUpgradesHTML = `
            <div class="mb-6">
                <h3 class="text-xl font-semibold mb-4 text-purple-400">
                    <i class="fas fa-hand-pointer mr-2"></i>Klick-Upgrades
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${clickUpgrades.map(upgrade => createUpgradeElement(upgrade)).join('')}
                </div>
            </div>
        `;
    }

    // Rendere Building-Upgrades
    const buildingUpgrades = upgrades.filter(upgrade => upgrade.type === 'building' && upgrade.unlocked);
    if (buildingUpgrades.length > 0) {
        buildingUpgradesHTML = `
            <div>
                <h3 class="text-xl font-semibold mb-4 text-emerald-400">
                    <i class="fas fa-building mr-2"></i>Mitarbeiter-Upgrades
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${buildingUpgrades.map(upgrade => createUpgradeElement(upgrade)).join('')}
                </div>
            </div>
        `;
    }

    upgradesContainer.innerHTML = clickUpgradesHTML + buildingUpgradesHTML;
}

function createUpgradeElement(upgrade) {
    const mitarbeiter = buildings.find(b => b.id === upgrade.requiredBuilding);
    const isPurchased = upgrade.purchased;
    const isLocked = !upgrade.unlocked && mitarbeiter;
    const canAfford = coinCount >= upgrade.cost;
    
    // Berechne die konkreten Produktionswerte
    let productionInfo = '';
    if (upgrade.synergy) {
        const gpu = buildings.find(b => b.id === 'gpu');
        if (upgrade.synergy.type === 'click') {
            const bonus = (upgrade.synergy.perUnit * gpu.count * 100).toFixed(1);
            productionInfo = `+${bonus}% RSL pro Klick`;
        } else if (upgrade.synergy.type === 'production') {
            const bonus = (upgrade.synergy.perUnit * gpu.count * 100).toFixed(1);
            productionInfo = `+${bonus}% Produktionsbonus`;
        }
    } else if (upgrade.special && upgrade.special.type === 'interval') {
        productionInfo = upgrade.tooltip.details;
    } else if (mitarbeiter) {
        const currentProduction = mitarbeiter.baseProduction * mitarbeiter.productionMultiplier * mitarbeiter.count;
        const newProduction = mitarbeiter.baseProduction * (mitarbeiter.productionMultiplier * upgrade.multiplier) * mitarbeiter.count;
        const productionIncrease = newProduction - currentProduction;
        productionInfo = `+${formatNumber(productionIncrease)} RSL/s`;
    }
    
    return `
        <button id="upgrade-${upgrade.id}"
                class="crypto-card flex flex-col gap-2 p-3 transition-all duration-200 relative group text-left
                       ${isPurchased ? 'opacity-50' : ''}
                       ${isLocked ? 'opacity-75 grayscale' : ''}
                       ${!isPurchased && !isLocked && !canAfford ? 'opacity-50 border border-red-500/30' : ''}
                       ${!isPurchased && !isLocked && canAfford ? 'hover:scale-102 hover:shadow-lg hover:shadow-purple-500/20' : ''}"
                ${(coinCount < upgrade.cost || isLocked || isPurchased) ? 'disabled' : ''}>
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br ${!isPurchased && !isLocked && !canAfford ? 'from-red-400 to-red-600' : 'from-purple-400 to-indigo-600'} flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-${upgrade.icon} text-white"></i>
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex justify-between items-center gap-2">
                        <span class="font-bold ${!isPurchased && !isLocked && !canAfford ? 'text-red-400' : 'text-purple-400'} truncate">${upgrade.name}</span>
                        ${isPurchased ? 
                            '<div class="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-medium">Gekauft</div>' : 
                            `<div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${!canAfford ? 'bg-red-500/10 text-red-400' : 'bg-purple-400/10 text-purple-400'} text-xs font-medium whitespace-nowrap">
                                <i class="fas fa-coins text-xs"></i>
                                ${formatNumber(upgrade.cost)} RSL
                            </div>`
                        }
                    </div>
                </div>
            </div>
            <p class="text-gray-400 text-sm text-left">${upgrade.tooltip.description}</p>
            ${!isPurchased && !isLocked ? `
                <div class="text-xs text-emerald-400 bg-emerald-400/5 px-2 py-1 rounded-lg mt-1">
                    <i class="fas fa-chart-line mr-1 opacity-50"></i>
                    ${productionInfo}
                </div>
            ` : ''}
            ${isLocked ? `
                <div class="text-xs text-red-400 bg-red-400/5 px-2 py-1 rounded-lg mt-1">
                    <i class="fas fa-lock-open mr-1 opacity-50"></i>
                    ${upgrade.tooltip.requirement}
                </div>
            ` : ''}
            ${!isPurchased && !isLocked && !canAfford ? `
                <div class="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Zu teuer
                </div>
            ` : ''}
        </button>
    `;
}

// Aktualisierte Funktion zum Anzeigen der Sprechblase
function showSpeechBubble(quote, isClickQuote) {
    // Entferne existierende Sprechblase
    if (activeSpeechBubble) {
        activeSpeechBubble.remove();
    }
    
    // Wähle Farben basierend auf Quote-Typ
    const borderColor = isClickQuote ? 'rgba(45, 212, 191, 0.3)' : 'rgba(239, 68, 68, 0.3)'; // teal für Click, rot für Idle
    const shadowColor = isClickQuote ? 'rgba(45, 212, 191, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    
    // Erstelle Sprechblase
    const speechBubble = document.createElement('div');
    speechBubble.className = 'absolute z-20 bg-gray-900/95 text-white px-6 py-4 rounded-xl animate-fade-in';
    speechBubble.style.left = 'calc(100% + 20px)';
    speechBubble.style.top = '50%';
    speechBubble.style.transform = 'translateY(-50%)';
    speechBubble.style.width = 'max-content';
    speechBubble.style.maxWidth = '300px';
    speechBubble.style.border = `2px solid ${borderColor}`;
    speechBubble.style.boxShadow = `0 0 20px ${shadowColor}`;
    
    // Füge Sprechblasen-Pfeil hinzu
    const arrow = document.createElement('div');
    arrow.className = 'absolute left-[-12px] top-1/2 -translate-y-1/2 w-0 h-0';
    arrow.style.borderTop = '10px solid transparent';
    arrow.style.borderBottom = '10px solid transparent';
    arrow.style.borderRight = `10px solid ${borderColor}`;
    
    // Füge inneren Pfeil für den Overlay-Effekt hinzu
    const innerArrow = document.createElement('div');
    innerArrow.className = 'absolute left-[-9px] top-1/2 -translate-y-1/2 w-0 h-0';
    innerArrow.style.borderTop = '8px solid transparent';
    innerArrow.style.borderBottom = '8px solid transparent';
    innerArrow.style.borderRight = '8px solid rgba(17, 24, 39, 0.95)';
    
    // Füge Text hinzu
    const text = document.createElement('p');
    text.className = `text-base font-medium ${isClickQuote ? 'text-emerald-400' : 'text-red-400'}`;
    text.textContent = quote;
    
    // Baue Sprechblase zusammen
    speechBubble.appendChild(arrow);
    speechBubble.appendChild(innerArrow);
    speechBubble.appendChild(text);
    
    // Finde den Whip-Container und stelle sicher, dass er relative Position hat
    const whipImage = document.querySelector('img[src="images/peitsche.png"]');
    const whipContainer = whipImage.parentElement;
    whipContainer.style.position = 'relative';
    whipContainer.style.width = '100%';
    whipContainer.style.display = 'flex';
    whipContainer.style.alignItems = 'center';
    
    // Erstelle einen Container für das Bild und die Sprechblase
    const imageWrapper = document.createElement('div');
    imageWrapper.style.position = 'relative';
    imageWrapper.style.display = 'inline-block';
    
    // Verschiebe das Bild in den neuen Container
    whipImage.parentElement.insertBefore(imageWrapper, whipImage);
    imageWrapper.appendChild(whipImage);
    imageWrapper.appendChild(speechBubble);
    
    activeSpeechBubble = speechBubble;
    
    // Entferne Sprechblase nach 3 Sekunden
    setTimeout(() => {
        speechBubble.classList.add('animate-fade-out');
        setTimeout(() => {
            if (speechBubble.parentElement) {
                speechBubble.remove();
            }
            if (activeSpeechBubble === speechBubble) {
                activeSpeechBubble = null;
            }
        }, 500);
    }, 3000);
}

// Füge CSS für Sprechblasen-Animationen hinzu
const bubbleStyle = document.createElement('style');
bubbleStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-50%) translateX(-20px); }
        to { opacity: 1; transform: translateY(-50%) translateX(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(-50%) translateX(0); }
        to { opacity: 0; transform: translateY(-50%) translateX(20px); }
    }
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-fade-out {
        animation: fadeOut 0.3s ease-out forwards;
    }
`;
document.head.appendChild(bubbleStyle);

// Neue Funktion zum Überprüfen der Inaktivität
function startIdleCheck() {
    // Stoppe vorheriges Intervall falls vorhanden
    if (idleCheckInterval) {
        clearInterval(idleCheckInterval);
    }
    
    // Prüfe alle 3 Sekunden
    idleCheckInterval = setInterval(() => {
        // Wenn in den letzten 3 Sekunden nicht geklickt wurde und keine Sprechblase aktiv ist
        if (Date.now() - lastClickTime >= 3000 && !activeSpeechBubble && idleQuotes.length > 0) {
            // 10% Chance auf einen Idle-Spruch
            if (Math.random() < 0.1) {
                const randomIdleQuote = idleQuotes[Math.floor(Math.random() * idleQuotes.length)];
                // Übergebe false für Idle-Quote
                showSpeechBubble(randomIdleQuote, false);
            }
        }
    }, 3000);
}

// Funktion zum Aktualisieren der Mining-Experten
function updateMiningExperts() {
    const expertsGrid = document.getElementById('mining-experts-grid');
    const expertsHeader = document.getElementById('mining-experts-header');
    const miningExpert = buildings.find(b => b.id === 'miningexpert');  // Changed from 'miningrig'
    
    // Zeige/verstecke Header basierend auf der Anzahl
    expertsHeader.classList.toggle('hidden', miningExpert.count === 0);
    
    // Lösche bestehende Experten
    expertsGrid.innerHTML = '';
    
    // Array mit verfügbaren Experten-Sprites (zunächst nur einer)
    const expertSprites = ['images/miner.png', 'images/miner2.png', 'images/miner3.png'];
    
    // Berechne den Abstand zwischen Experten basierend auf der Anzahl
    const containerWidth = expertsGrid.offsetWidth;
    const baseWidth = 96; // w-24 entspricht 96px
    const minGap = -48; // Maximale Überlappung in Pixeln
    const maxGap = 8; // Normaler Abstand wenn wenige Experten
    
    // Setze die Grid-Eigenschaften
    expertsGrid.style.display = 'flex';
    expertsGrid.style.flexDirection = 'column';
    expertsGrid.style.alignItems = 'center';
    expertsGrid.style.overflow = 'hidden';
    expertsGrid.style.padding = '1rem 0';
    expertsGrid.style.minHeight = '180px';
    
    const totalExperts = miningExpert.count;
    const rowSize = 15; // Experten pro Reihe
    const numRows = Math.ceil(totalExperts / rowSize);
    
    // Erstelle die Reihen
    const rows = [];
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'center';
        row.style.flexWrap = 'nowrap';
        row.style.position = 'relative';
        row.style.zIndex = rowIndex + 1; // Jede neue Reihe kommt nach vorne
        
        // Einheitliche Überlappung für alle Reihen nach der ersten
        if (rowIndex > 0) {
            row.style.marginTop = '-70px'; // Konstante Überlappung für alle Reihen
        }
        
        rows.push(row);
    }
    
    // Verteile die Experten auf die Reihen
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const startIndex = rowIndex * rowSize;
        const endIndex = Math.min(startIndex + rowSize, totalExperts);
        const expertsInThisRow = endIndex - startIndex;
        
        // Berechne den Abstand für diese Reihe
        const rowGap = Math.min(maxGap, Math.max(minGap, (containerWidth - (expertsInThisRow * baseWidth)) / (expertsInThisRow - 1 || 1)));
        
        // Füge Experten zur Reihe hinzu
        for (let i = startIndex; i < endIndex; i++) {
            const isFirstInRow = i === startIndex;
            const expertImg = createMiningExpertSprite(i, expertSprites, isFirstInRow ? '0' : `${rowGap}px`);
            rows[rowIndex].appendChild(expertImg);
        }
    }
    
    // Füge alle Reihen zum Grid hinzu
    rows.forEach(row => expertsGrid.appendChild(row));
}

// Hilfsfunktion zum Erstellen eines Mining-Experten-Sprites
function createMiningExpertSprite(index, sprites, marginLeft) {
    const expertImg = document.createElement('div');
    expertImg.className = 'relative group flex-shrink-0';
    expertImg.style.marginLeft = marginLeft;
    
    const spriteIndex = index % sprites.length;
    expertImg.innerHTML = `
        <div class="relative">
            <img src="${sprites[spriteIndex]}" 
                 alt="Mining-Experte" 
                 class="w-24 h-28 object-contain transition-all duration-300 hover:scale-105 hover:rotate-2 expert-sprite hover:z-10"
                 style="filter: drop-shadow(0 0 12px rgba(45, 212, 191, 0.3));">
            <img src="images/server.png"
                 alt="Server"
                 class="absolute top-0 left-[-8px] w-24 h-28 object-contain server-sprite"
                 style="filter: drop-shadow(0 0 8px rgba(45, 212, 191, 0.2));">
        </div>
    `;
    
    return expertImg;
}

// Funktion zum Aktualisieren der Rechenzentrumsleiter
function updateDatacenterLeaders() {
    const leadersGrid = document.getElementById('datacenter-leaders-grid');
    const leadersHeader = document.getElementById('datacenter-leaders-header');
    const datacenterLeader = buildings.find(b => b.id === 'datacenterleader');  // Changed from 'datacenter'
    
    // Zeige/verstecke Header basierend auf der Anzahl
    leadersHeader.classList.toggle('hidden', datacenterLeader.count === 0);
    
    // Lösche bestehende Leiter
    leadersGrid.innerHTML = '';
    
    // Array mit verfügbaren Leiter-Sprites
    const leaderSprites = ['images/rzleiter.png', 'images/rzleiter2.png', 'images/rzleiter3.png'];
    
    // Berechne den Abstand zwischen Leitern basierend auf der Anzahl
    const containerWidth = leadersGrid.offsetWidth;
    const baseWidth = 96; // w-24 entspricht 96px
    const minGap = -48; // Maximale Überlappung in Pixeln
    const maxGap = 8; // Normaler Abstand wenn wenige Leiter
    
    // Setze die Grid-Eigenschaften
    leadersGrid.style.display = 'flex';
    leadersGrid.style.flexDirection = 'column';
    leadersGrid.style.alignItems = 'center';
    leadersGrid.style.overflow = 'hidden';
    leadersGrid.style.padding = '1rem 0';
    leadersGrid.style.minHeight = '180px';
    
    const totalLeaders = datacenterLeader.count;
    const rowSize = 15; // Leiter pro Reihe
    const numRows = Math.ceil(totalLeaders / rowSize);
    
    // Erstelle die Reihen
    const rows = [];
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'center';
        row.style.flexWrap = 'nowrap';
        row.style.position = 'relative';
        row.style.zIndex = rowIndex + 1; // Jede neue Reihe kommt nach vorne
        
        // Einheitliche Überlappung für alle Reihen nach der ersten
        if (rowIndex > 0) {
            row.style.marginTop = '-70px'; // Konstante Überlappung für alle Reihen
        }
        
        rows.push(row);
    }
    
    // Verteile die Leiter auf die Reihen
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const startIndex = rowIndex * rowSize;
        const endIndex = Math.min(startIndex + rowSize, totalLeaders);
        const leadersInThisRow = endIndex - startIndex;
        
        // Berechne den Abstand für diese Reihe
        const rowGap = Math.min(maxGap, Math.max(minGap, (containerWidth - (leadersInThisRow * baseWidth)) / (leadersInThisRow - 1 || 1)));
        
        // Füge Leiter zur Reihe hinzu
        for (let i = startIndex; i < endIndex; i++) {
            const isFirstInRow = i === startIndex;
            const leaderImg = createDatacenterLeaderSprite(i, leaderSprites, isFirstInRow ? '0' : `${rowGap}px`);
            rows[rowIndex].appendChild(leaderImg);
        }
    }
    
    // Füge alle Reihen zum Grid hinzu
    rows.forEach(row => leadersGrid.appendChild(row));
}

// Hilfsfunktion zum Erstellen eines Rechenzentrumsleiter-Sprites
function createDatacenterLeaderSprite(index, sprites, marginLeft) {
    const leaderImg = document.createElement('div');
    leaderImg.className = 'relative group flex-shrink-0';
    leaderImg.style.marginLeft = marginLeft;
    
    const spriteIndex = index % sprites.length;
    leaderImg.innerHTML = `
        <div class="relative">
            <img src="${sprites[spriteIndex]}" 
                 alt="Rechenzentrumsleiter" 
                 class="w-24 h-28 object-contain transition-all duration-300 hover:scale-105 hover:rotate-2 leader-sprite hover:z-10"
                 style="filter: drop-shadow(0 0 12px rgba(45, 212, 191, 0.3));">
            <!-- <img src="images/server.png"
                 alt="Rechenzentrum"
                 class="absolute top-0 left-[-8px] w-24 h-28 object-contain server-sprite"
                 style="filter: drop-shadow(0 0 8px rgba(45, 212, 191, 0.2));"> -->
        </div>
    `;
    
    return leaderImg;
}

// Starte die Animationen beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    startRandomBounces();
    updateStatsText();
    
    // Verstecke den Cheat-Button initial
    const cheatButton = document.getElementById('cheat-button');
    if (cheatButton) {
        cheatButton.style.display = 'none';
    }
    
    // Cheat Button Funktionalität
    if (cheatButton) {
        cheatButton.addEventListener('click', () => {
            coinCount += 10000000; // +10M RSL
            updateCoinCount();
            
            // Visuelles Feedback
            const floatingText = document.createElement('div');
            floatingText.className = 'floating-text text-2xl font-bold text-purple-400';
            floatingText.textContent = '+10M RSL';
            
            // Position relativ zum Button
            const buttonRect = cheatButton.getBoundingClientRect();
            floatingText.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
            floatingText.style.top = `${buttonRect.top}px`;
            
            document.body.appendChild(floatingText);
            
            // Entferne den Text nach der Animation
            setTimeout(() => floatingText.remove(), 1000);
            
        });
    }
});

// Neue Funktion zum Berechnen der GPU-Synergien
function calculateGPUSynergies() {
    const gpu = buildings.find(b => b.id === 'gpu');
    if (!gpu || gpu.count === 0) return { clickMultiplier: 1, productionMultiplier: 1 };

    let totalClickBonus = 0;
    let totalProductionBonus = 0;

    // Finde alle gekauften GPU-Synergie-Upgrades
    upgrades.filter(u => u.purchased && u.synergy).forEach(upgrade => {
        if (upgrade.synergy.type === 'click') {
            totalClickBonus += upgrade.synergy.perUnit * gpu.count;
        } else if (upgrade.synergy.type === 'production') {
            totalProductionBonus += upgrade.synergy.perUnit * gpu.count;
        }
    });

    return {
        clickMultiplier: 1 + totalClickBonus,
        productionMultiplier: 1 + totalProductionBonus
    };
}

// Neue Funktion zum Rendern der gekauften Upgrades
function renderPurchasedUpgrades() {
    const purchasedContainer = document.getElementById('purchased-upgrades');
    if (!purchasedContainer) return;

    // Teile die gekauften Upgrades in Kategorien auf
    const rankUpgrades = upgrades.filter(u => u.purchased && u.type === 'click');
    const efficiencyUpgrades = upgrades.filter(u => u.purchased && !u.type);

    purchasedContainer.innerHTML = `
        <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-trophy text-emerald-400"></i>
            <h3 class="text-xl font-bold text-emerald-400">Deine Upgrades</h3>
        </div>
        <div class="crypto-card">
            ${efficiencyUpgrades.length > 0 ? `
                <div class="p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <i class="fas fa-chart-line text-purple-400"></i>
                        <h4 class="font-bold text-purple-400">Effizienz-Upgrades</h4>
                    </div>
                    <div class="flex flex-wrap gap-2" id="efficiency-upgrades-container">
                        ${efficiencyUpgrades.map(upgrade => {
                            let description = upgrade.tooltip.description;
                            if (upgrade.synergy) {
                                const gpu = buildings.find(b => b.id === 'gpu');
                                if (upgrade.synergy.type === 'click') {
                                    const bonus = (upgrade.synergy.perUnit * gpu.count * 100).toFixed(1);
                                    description = `+${bonus}% RSL pro Klick durch GPU-Synergie`;
                                } else if (upgrade.synergy.type === 'production') {
                                    const bonus = (upgrade.synergy.perUnit * gpu.count * 100).toFixed(1);
                                    description = `+${bonus}% Produktionsbonus durch GPU-Synergie`;
                                }
                            }
                            return `
                                <div class="relative group">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-110 cursor-help">
                                        <i class="fas fa-${upgrade.icon} text-white"></i>
                                    </div>
                                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                        <div class="text-purple-400 font-bold text-sm mb-1">${upgrade.name}</div>
                                        <div class="text-gray-300 text-xs">${description}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}

            ${rankUpgrades.length > 0 ? `
                <div class="p-4 ${efficiencyUpgrades.length > 0 ? 'border-t border-gray-800' : ''}">
                    <div class="flex items-center gap-2 mb-3">
                        <i class="fas fa-crown text-amber-400"></i>
                        <h4 class="font-bold text-amber-400">Rang-Upgrades</h4>
                    </div>
                    <div class="flex flex-wrap gap-2" id="rank-upgrades-container">
                        ${rankUpgrades.map(upgrade => {
                            let description = upgrade.tooltip.description;
                            return `
                                <div class="relative group">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-110 cursor-help">
                                        <i class="fas fa-${upgrade.icon} text-white"></i>
                                    </div>
                                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                        <div class="text-amber-400 font-bold text-sm mb-1">${upgrade.name}</div>
                                        <div class="text-gray-300 text-xs">${description}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'Mrd';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 10000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString();
}