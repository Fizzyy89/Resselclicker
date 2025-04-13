// Statistics Manager für Ressel Clicker
export class StatisticsManager {
    constructor() {
        this.initializeStats();
    }

    // Neue Methode zum Initialisieren der Stats
    initializeStats() {
        this.stats = {
            // Klick-bezogene Statistiken
            totalManualClicks: 0,        // Anzahl manueller Klicks
            totalGPUClicks: 0,           // Anzahl GPU-Klicks
            totalClickValue: 0,          // Gesamtwert aller Klicks (manuell + GPU)
            
            // RSL-bezogene Statistiken
            totalRSLEarned: 0,           // Gesamt verdiente RSL (inkl. ausgegeben)
            totalRSLSpent: 0,            // Gesamt ausgegebene RSL
            peakRSLPerSecond: 0,         // Höchste RSL/Sekunde
            
            // Zeit-bezogene Statistiken
            totalPlayTime: 0,            // Gesamte Spielzeit in Sekunden
            sessionStartTime: Date.now(), // Start der aktuellen Session
            lastSaveTime: Date.now(),    // Zeitpunkt des letzten Saves
            lastSessionTime: 0,          // Gespeicherte Zeit aus vorherigen Sessions
            lastUpdateTime: Date.now(),   // Zeitpunkt des letzten Updates
            
            // Mitarbeiter-bezogene Statistiken
            totalStaffHired: 0,          // Gesamt eingestellte Mitarbeiter
            staffBreakdown: {            // Aufschlüsselung nach Typ
                gpu: 0,
                sgadmin: 0,
                miningexpert: 0,
                datacenterleader: 0
            },
            
            // Upgrade-bezogene Statistiken
            totalUpgradesPurchased: 0,   // Gesamt gekaufte Upgrades
            upgradeBreakdown: {          // Aufschlüsselung nach Kategorie
                click: 0,
                gpu: 0,
                mitarbeiter: 0,
                synergy: 0
            }
        };
    }

    // Neue Reset-Methode
    reset() {
        this.initializeStats();
    }

    // === Event Handler ===
    
    // Registriere einen manuellen Klick
    onManualClick(value) {
        this.stats.totalManualClicks++;
        this.stats.totalClickValue += value;
        this.stats.totalRSLEarned += value;
    }

    // Registriere einen GPU-Klick
    onGPUClick(value) {
        this.stats.totalGPUClicks++;
        this.stats.totalClickValue += value;
        this.stats.totalRSLEarned += value;
    }

    // Registriere passive Einnahmen
    onPassiveEarnings(value) {
        this.stats.totalRSLEarned += value;
    }

    // Registriere Ausgaben
    onRSLSpent(value) {
        this.stats.totalRSLSpent += value;
    }

    // Aktualisiere Peak RSL/Sekunde
    updatePeakRSLPerSecond(currentRSLPerSecond) {
        if (currentRSLPerSecond > this.stats.peakRSLPerSecond) {
            this.stats.peakRSLPerSecond = currentRSLPerSecond;
        }
    }

    // Registriere einen neuen Mitarbeiter
    onStaffHired(staffType) {
        this.stats.totalStaffHired++;
        if (this.stats.staffBreakdown.hasOwnProperty(staffType)) {
            this.stats.staffBreakdown[staffType]++;
        }
    }

    // Registriere ein neues Upgrade
    onUpgradePurchased(upgradeType) {
        this.stats.totalUpgradesPurchased++;
        if (this.stats.upgradeBreakdown.hasOwnProperty(upgradeType)) {
            this.stats.upgradeBreakdown[upgradeType]++;
        }
    }

    // === Zeit-Management ===
    
    // Aktualisiere die Spielzeit
    updatePlayTime() {
        const now = Date.now();
        // Berechne nur die Zeit seit dem letzten Update
        const timeSinceLastUpdate = Math.floor((now - this.stats.lastUpdateTime) / 1000);
        this.stats.totalPlayTime += timeSinceLastUpdate;
        this.stats.lastUpdateTime = now;
    }

    // === Speichern & Laden ===
    
    // Speichere die Statistiken in ein Objekt
    toJSON() {
        this.updatePlayTime();
        return {
            ...this.stats,
            lastSaveTime: Date.now()
        };
    }

    // Lade Statistiken aus einem Objekt
    fromJSON(savedStats) {
        if (!savedStats) return;
        
        // Übernehme alle gespeicherten Statistiken
        Object.assign(this.stats, savedStats);
        
        // Aktualisiere session-spezifische Werte
        const now = Date.now();
        this.stats.sessionStartTime = now;
        this.stats.lastUpdateTime = now;
    }

    // === Getter für formatierte Statistiken ===
    
    // Formatiere Zeitdauer
    formatPlayTime() {
        const totalSeconds = this.stats.totalPlayTime;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Formatiere große Zahlen
    formatNumber(num) {
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

    // Hole alle formatierten Statistiken
    getFormattedStats() {
        this.updatePlayTime();
        return {
            totalManualClicks: this.formatNumber(this.stats.totalManualClicks),
            totalGPUClicks: this.formatNumber(this.stats.totalGPUClicks),
            totalClickValue: this.formatNumber(this.stats.totalClickValue),
            totalRSLEarned: this.formatNumber(this.stats.totalRSLEarned),
            totalRSLSpent: this.formatNumber(this.stats.totalRSLSpent),
            peakRSLPerSecond: this.formatNumber(this.stats.peakRSLPerSecond),
            totalPlayTime: this.formatPlayTime(),
            totalStaffHired: this.formatNumber(this.stats.totalStaffHired),
            staffBreakdown: {
                gpu: this.formatNumber(this.stats.staffBreakdown.gpu),
                sgadmin: this.formatNumber(this.stats.staffBreakdown.sgadmin),
                miningexpert: this.formatNumber(this.stats.staffBreakdown.miningexpert),
                datacenterleader: this.formatNumber(this.stats.staffBreakdown.datacenterleader)
            },
            totalUpgradesPurchased: this.formatNumber(this.stats.totalUpgradesPurchased),
            upgradeBreakdown: {
                click: this.formatNumber(this.stats.upgradeBreakdown.click),
                gpu: this.formatNumber(this.stats.upgradeBreakdown.gpu),
                mitarbeiter: this.formatNumber(this.stats.upgradeBreakdown.mitarbeiter),
                synergy: this.formatNumber(this.stats.upgradeBreakdown.synergy)
            }
        };
    }
} 