// =========================================
// MITARBEITER CONFIGURATIONS
// =========================================
export const staff = [
    {
        id: 'gpu',
        name: 'GPU',
        tooltip: {
            title: 'GPU',
            description: 'GPUs sind die zentrale Komponente im Mining und haben viele Synergie-Effekte. Da der Markt von Scalpern beherrscht wird, können die Preise rasant steigen.',
            details: 'Führt alle 10 Sekunden automatisch einen Klick aus. Hat starke Synergie-Effekte mit anderen Komponenten.'
        },
        baseCost: 50,
        costMultiplier: 1.22, // Steilerer Preisanstieg pro GPU
        count: 0,
        productionMultiplier: 1,
        icon: 'microchip',
        unlocked: true,
        special: {
            type: 'autoClick',
            interval: 10000
        }
    },
    {
        id: 'sgadmin',
        name: 'SG-Admin',
        tooltip: {
            title: 'Sachgebiets-Admin',
            description: 'Die SG-Admins sind die Dulli-Truppe, die jegliche Arbeit zugeschoben bekommt, welche die anderen nicht machen wollen. Also perfekt für das Mining-Team.',
            details: 'Produziert 1 RSL pro Sekunde. Günstig aber effektiv - perfekt für den Einstieg.'
        },
        baseCost: 100,
        count: 0,
        baseProduction: 1,
        productionMultiplier: 1,
        icon: 'user-tie'
    },
    {
        id: 'miningexpert',
        name: 'Mining-Experte',
        tooltip: {
            title: 'Mining-Experte',
            description: 'Diese Typen haben sich in der IT einen Namen gemacht und verfügen über bessere Hardware als die anderen. Vielleicht bringts ja was.',
            details: 'Produziert 8 RSL pro Sekunde. Ein erfahrener Mitarbeiter mit deutlich höherer Effizienz.'
        },
        baseCost: 1100,
        count: 0,
        baseProduction: 8,
        productionMultiplier: 1,
        icon: 'user-gear',
        unlocked: true
    },
    {
        id: 'datacenterleader',
        name: 'Rechenzentrumsleiter',
        tooltip: {
            title: 'Rechenzentrumsleiter',
            description: 'Tpyisches Middle-Management. Labern viel, machen eigentlich nichts, aber irgendwie kommt trotzdem RSL bei rum.',
            details: 'Produziert 85 RSL pro Sekunde. Der effizienteste Mitarbeiter für die Massenproduktion.'
        },
        baseCost: 12000,
        count: 0,
        baseProduction: 85,
        productionMultiplier: 1,
        icon: 'user-tie',
        unlocked: true
    }
];

// =========================================
// UPGRADE CONFIGURATIONS
// =========================================
export const upgrades = [
    // === GPU Synergy Upgrades ===
    {
        id: 'gpu_synergy_click1',
        name: 'GPU-Klick-Synergie I',
        category: 'synergy',
        tooltip: {
            title: 'GPU-Klick-Synergie I',
            description: 'Jede GPU erhöht deinen Klick-Wert um 1%.',
            details: 'Jede vorhandene GPU erhöht deinen Klick-Wert permanent um 1%.',
            requirement: 'Benötigt: 5 GPUs'
        },
        cost: 2500,
        requiredBuilding: 'gpu',
        requiredCount: 5,
        synergy: {
            type: 'click',
            perUnit: 0.01 // 1% pro GPU
        },
        icon: 'microchip',
        purchased: false,
        unlocked: false,
        tier: 1
    },
    {
        id: 'gpu_synergy_click2',
        name: 'GPU-Klick-Synergie II',
        category: 'synergy',
        tooltip: {
            title: 'GPU-Klick-Synergie II',
            description: 'Jede GPU erhöht deinen Klick-Wert um zusätzliche 2%.',
            details: 'Jede vorhandene GPU erhöht deinen Klick-Wert permanent um weitere 2%.',
            requirement: 'Benötigt: 15 GPUs und GPU-Klick-Synergie I'
        },
        cost: 12500,
        requiredBuilding: 'gpu',
        requiredCount: 15,
        requires: 'gpu_synergy_click1',
        synergy: {
            type: 'click',
            perUnit: 0.02 // 2% pro GPU
        },
        icon: 'microchip',
        purchased: false,
        unlocked: false,
        tier: 2
    },
    {
        id: 'gpu_synergy_click3',
        name: 'GPU-Klick-Synergie III',
        category: 'synergy',
        tooltip: {
            title: 'GPU-Klick-Synergie III',
            description: 'Jede GPU erhöht deinen Klick-Wert um zusätzliche 3%.',
            details: 'Jede vorhandene GPU erhöht deinen Klick-Wert permanent um weitere 3%.',
            requirement: 'Benötigt: 30 GPUs und GPU-Klick-Synergie II'
        },
        cost: 50000,
        requiredBuilding: 'gpu',
        requiredCount: 30,
        requires: 'gpu_synergy_click2',
        synergy: {
            type: 'click',
            perUnit: 0.03 // 3% pro GPU
        },
        icon: 'microchip',
        purchased: false,
        unlocked: false,
        tier: 3
    },
    {
        id: 'gpu_synergy_prod1',
        name: 'GPU-Produktions-Synergie I',
        category: 'synergy',
        tooltip: {
            title: 'GPU-Produktions-Synergie I',
            description: 'Jede GPU erhöht die Produktion aller Mitarbeiter um 0.5%.',
            details: 'Jede vorhandene GPU erhöht die Produktion aller Mitarbeiter permanent um 0.5%.',
            requirement: 'Benötigt: 10 GPUs'
        },
        cost: 5000,
        requiredBuilding: 'gpu',
        requiredCount: 10,
        synergy: {
            type: 'production',
            perUnit: 0.005 // 0.5% pro GPU
        },
        icon: 'microchip',
        purchased: false,
        unlocked: false,
        tier: 1
    },
    {
        id: 'gpu_synergy_prod2',
        name: 'GPU-Produktions-Synergie II',
        category: 'synergy',
        tooltip: {
            title: 'GPU-Produktions-Synergie II',
            description: 'Jede GPU erhöht die Produktion aller Mitarbeiter um zusätzliche 1%.',
            details: 'Jede vorhandene GPU erhöht die Produktion aller Mitarbeiter permanent um weitere 1%.',
            requirement: 'Benötigt: 20 GPUs und GPU-Produktions-Synergie I'
        },
        cost: 25000,
        requiredBuilding: 'gpu',
        requiredCount: 20,
        requires: 'gpu_synergy_prod1',
        synergy: {
            type: 'production',
            perUnit: 0.01 // 1% pro GPU
        },
        icon: 'microchip',
        purchased: false,
        unlocked: false,
        tier: 2
    },
    {
        id: 'gpu_synergy_prod3',
        name: 'GPU-Produktions-Synergie III',
        category: 'synergy',
        tooltip: {
            title: 'GPU-Produktions-Synergie III',
            description: 'Jede GPU erhöht die Produktion aller Mitarbeiter um zusätzliche 1.5%.',
            details: 'Jede vorhandene GPU erhöht die Produktion aller Mitarbeiter permanent um weitere 1.5%.',
            requirement: 'Benötigt: 35 GPUs und GPU-Produktions-Synergie II'
        },
        cost: 100000,
        requiredBuilding: 'gpu',
        requiredCount: 35,
        requires: 'gpu_synergy_prod2',
        synergy: {
            type: 'production',
            perUnit: 0.015 // 1.5% pro GPU
        },
        icon: 'microchip',
        purchased: false,
        unlocked: false,
        tier: 3
    },
    // === Click Upgrades ===
    {
        id: 'click_power1',
        name: 'Praktikant',
        tooltip: {
            title: 'Praktikanten-Power',
            description: 'Unbezahlt, aber du darfst für den großen Wolfgang schuften. Verdoppelt die RSL pro Klick.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 2.',
            requirement: 'Keine Voraussetzungen'
        },
        cost: 50,
        multiplier: 2,
        icon: 'hand-pointer',
        purchased: false,
        unlocked: true,
        type: 'click',
        tier: 1
    },
    {
        id: 'click_power2',
        name: 'Werkstudent',
        tooltip: {
            title: 'Werkstudenten-Power',
            description: 'Du bist fast sowas wie ein Mensch. Verfünffacht die RSL pro Klick.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 5.',
            requirement: 'Benötigt: Praktikant'
        },
        cost: 500,
        multiplier: 5,
        icon: 'hand-point-up',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 2,
        requires: 'click_power1'
    },
    {
        id: 'click_power3',
        name: 'Azubi',
        tooltip: {
            title: 'Azubi-Power',
            description: 'Ein engagierter Azubi revolutioniert deine Klick-Methoden. Multipliziert die RSL pro Klick mit 15.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 15.',
            requirement: 'Benötigt: Werkstudent'
        },
        cost: 2500,
        multiplier: 15,
        icon: 'hand-back-fist',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 3,
        requires: 'click_power2'
    },
    {
        id: 'click_power4',
        name: 'Ausgelernt',
        tooltip: {
            title: 'Ausgelernte Power',
            description: 'Ein frisch ausgelernter Mitarbeiter bringt neue Perspektiven ein. Multipliziert die RSL pro Klick mit 50.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 50.',
            requirement: 'Benötigt: Azubi'
        },
        cost: 10000,
        multiplier: 50,
        icon: 'graduation-cap',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 4,
        requires: 'click_power3'
    },
    {
        id: 'click_power5',
        name: 'Schulteam',
        tooltip: {
            title: 'Schulteam-Power',
            description: 'Das Schulteam optimiert alle Prozesse durch professionelle Weiterbildung. Multipliziert die RSL pro Klick mit 150.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 150.',
            requirement: 'Benötigt: Ausgelernt'
        },
        cost: 50000,
        multiplier: 150,
        icon: 'chalkboard-user',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 5,
        requires: 'click_power4'
    },
    {
        id: 'click_power6',
        name: 'Client-Team',
        tooltip: {
            title: 'Client-Team Power',
            description: 'Das Client-Team revolutioniert die Arbeitsplatzumgebung. Multipliziert die RSL pro Klick mit 500.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 500.',
            requirement: 'Benötigt: Schulteam'
        },
        cost: 250000,
        multiplier: 500,
        icon: 'desktop',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 6,
        requires: 'click_power5'
    },
    {
        id: 'click_power7',
        name: 'Fachverfahren',
        tooltip: {
            title: 'Fachverfahren-Power',
            description: 'Die Fachverfahren automatisieren komplexe Arbeitsprozesse. Multipliziert die RSL pro Klick mit 2.000.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 2.000.',
            requirement: 'Benötigt: Client-Team'
        },
        cost: 250000,
        multiplier: 2000,
        icon: 'gears',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 7,
        requires: 'click_power6'
    },
    {
        id: 'click_power8',
        name: 'IT.Digital',
        tooltip: {
            title: 'IT.Digital Power',
            description: 'IT.Digital führt innovative Technologien ein.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 7.500.',
            requirement: 'Benötigt: Fachverfahren'
        },
        cost: 5000000,
        multiplier: 7500,
        icon: 'microchip',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 8,
        requires: 'click_power7'
    },
    {
        id: 'click_power9',
        name: 'Arbeitsgruppenleiter',
        tooltip: {
            title: 'Arbeitsgruppenleiter-Power',
            description: 'Der Arbeitsgruppenleiter koordiniert alle IT-Prozesse.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 25.000.',
            requirement: 'Benötigt: IT.Digital'
        },
        cost: 25000000,
        multiplier: 25000,
        icon: 'users-gear',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 9,
        requires: 'click_power8'
    },
    {
        id: 'click_power10',
        name: 'IT-Leiter',
        tooltip: {
            title: 'IT-Leiter Power',
            description: 'Der IT-Leiter revolutioniert die gesamte IT-Struktur.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 100.000.',
            requirement: 'Benötigt: Arbeitsgruppenleiter'
        },
        cost: 100000000,
        multiplier: 100000,
        icon: 'server',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 10,
        requires: 'click_power9'
    },
    {
        id: 'click_power11',
        name: 'Kettemer',
        tooltip: {
            title: 'Kettemer-Power',
            description: 'Kettemer optimiert die IT-Strategie des gesamten Landkreises.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 500.000.',
            requirement: 'Benötigt: IT-Leiter'
        },
        cost: 500000000,
        multiplier: 500000,
        icon: 'chess-king',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 11,
        requires: 'click_power10'
    },
    {
        id: 'click_power12',
        name: 'Landrätin',
        tooltip: {
            title: 'Landrätin-Power',
            description: 'Die Landrätin ermöglicht wegweisende IT-Innovationen.',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 2.500.000.',
            requirement: 'Benötigt: Kettemer'
        },
        cost: 2500000000,
        multiplier: 2500000,
        icon: 'crown',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 12,
        requires: 'click_power11'
    },
    {
        id: 'click_power13',
        name: 'Ressel',
        tooltip: {
            title: 'Ressel-Power',
            description: 'Ressel verleiht dir seine ultimative Power!',
            details: 'Multipliziert die Menge an RSL, die du pro Klick erhältst, mit 10.000.000.',
            requirement: 'Benötigt: Landrätin'
        },
        cost: 10000000000,
        multiplier: 10000000,
        icon: 'hat-wizard',
        purchased: false,
        unlocked: false,
        type: 'click',
        tier: 13,
        requires: 'click_power12'
    },

    // === GPU Upgrades ===
    {
        id: 'gpu_efficiency1',
        name: 'RTX Kerne',
        category: 'gpu',
        tooltip: {
            title: 'RTX-Upgrade',
            description: 'Wolfgang bastelt ein paar Raytracing-Kerne in alle GPUs.',
            details: 'Klick-Intervall: 10 Sek → 8 Sek',
            requirement: 'Benötigt: 10 GPUs'
        },
        cost: 1500,
        requiredBuilding: 'gpu',
        requiredCount: 10,
        special: {
            type: 'interval',
            value: 8000
        },
        icon: 'microchip',
        purchased: false,
        unlocked: false,
        tier: 1
    },
    {
        id: 'gpu_efficiency2',
        name: 'Quantum GPUs',
        category: 'gpu',
        tooltip: {
            title: 'Quantum-Computing Upgrade',
            description: 'Wir beziehen bei der AKDB die neuesten Quanten-GPUs.',
            details: 'Klick-Intervall: 8 Sek → 6 Sek',
            requirement: 'Benötigt: 25 GPUs und RTX GPUs'
        },
        cost: 10000,
        requiredBuilding: 'gpu',
        requiredCount: 25,
        requires: 'gpu_efficiency1',
        special: {
            type: 'interval',
            value: 6000
        },
        icon: 'atom',
        purchased: false,
        unlocked: false,
        tier: 2
    },

    // === SG-Admin Upgrades ===
    {
        id: 'sgadmin_efficiency1',
        name: 'Kaffeevollautomat',
        category: 'mitarbeiter',
        tooltip: {
            title: 'Kaffeemaschinen-Upgrade',
            description: 'Wolfgang spendiert einen schicken Vollautomat für deine SG-Admins.',
            details: 'Erhöht die Effizienz aller SG-Admins um 50% durch erhöhte Koffeinzufuhr.',
            requirement: 'Benötigt: 3 Admins',
            display: '+50% Effizienz aller Admins'
        },
        cost: 500,
        requiredBuilding: 'sgadmin',
        requiredCount: 3,
        multiplier: 1.5,
        icon: 'mug-hot',
        purchased: false,
        unlocked: false,
        tier: 1
    },
    {
        id: 'sgadmin_efficiency2',
        name: 'Celos anheuern',
        category: 'mitarbeiter',
        tooltip: {
            title: 'Celos anheuern',
            description: 'Die Saubande von Celos übernimmt den First-Level, dadurch ist mehr Zeit fürs schürfen!',
            details: 'Erhöht erneut die Effizienz aller Admins um 75%.',
            requirement: 'Benötigt: 25 Admins und Kaffeevollautomat',
            display: '+75% Effizienz aller Admins'
        },
        cost: 5000,
        requires: 'sgadmin_efficiency1',
        requiredBuilding: 'sgadmin',
        requiredCount: 25,
        multiplier: 1.75,
        icon: 'keyboard',
        purchased: false,
        unlocked: false,
        tier: 2
    },

    // === Mining Expert Upgrades ===
    {
        id: 'miningexpert_efficiency1',
        name: 'Überwachungssystem',
        category: 'mitarbeiter',
        tooltip: {
            title: 'Überwachungssystem',
            description: 'Ein neues Monitoring-System hilft den Experten, ihre Ressourcen besser zu verwalten.',
            details: 'Erhöht die Effizienz aller Mining-Experten um 50% durch optimierte Ressourcennutzung.',
            requirement: 'Benötigt: 3 Mining-Experten',
            display: '+50% Effizienz aller Experten'
        },
        cost: 2500,
        requiredBuilding: 'miningexpert',
        requiredCount: 3,
        multiplier: 1.5,
        icon: 'gauge',
        purchased: false,
        unlocked: false,
        tier: 1
    },
    {
        id: 'miningexpert_efficiency2',
        name: 'Neue Virtualisierung',
        category: 'mitarbeiter',
        tooltip: {
            title: 'Neue Virtualisierung',
            description: 'C. Baur hat endlich die neuen Server bekommen, jetzt gibts Kerne ohne Ende!',
            details: 'Verdoppelt die Effizienz aller Mining Rigs durch bessere Temperaturkontrolle.',
            requirement: 'Benötigt: 10 Mining-Experten und Überwachungssystem',
            display: '+75% Effizienz aller Experten'
        },
        cost: 15000,
        requires: 'miningexpert_efficiency1',
        requiredBuilding: 'miningexpert',
        requiredCount: 10,
        multiplier: 1.75,
        icon: 'server',
        purchased: false,
        unlocked: false,
        tier: 2
    },

    // === Data Center Upgrades ===
    {
        id: 'datacenterleader_efficiency1',
        name: 'Fortbildung',
        category: 'mitarbeiter',
        tooltip: {
            title: 'Fortbildung',
            description: 'Die Chefs nehmen an einer superwichtigen Fortbildung teil und werden dadurch noch cheffiger.',
            details: 'Verdoppelt die Effizienz aller Rechenzentrumsleiter durch krasse Führungskompetenz (zwinker).',
            requirement: 'Benötigt: 3 RZ-Leiter',
            display: '+100% Effizienz aller RZ-Leiter'
        },
        cost: 50000,
        requiredBuilding: 'datacenterleader',
        requiredCount: 5,
        multiplier: 2,
        icon: 'chalkboard-user',
        purchased: false,
        unlocked: false,
        tier: 1
    },
    {
        id: 'datacenterleader_efficiency2',
        name: 'Freie Hand',
        category: 'mitarbeiter',
        tooltip: {
            title: 'Freie Hand',
            description: 'Die kommunale IT wird in eine eigenständige GmbH ausgegliedert.',
            details: 'Verdreifacht die Effizienz aller Rechenzentrumsleiter durch mehr Entscheidungsfreiheit.',
            requirement: 'Benötigt: 10 RZ-Leiter',
            display: '+300% Effizienz aller RZ-Leiter'
        },
        cost: 200000,
        requiredBuilding: 'datacenterleader',
        requiredCount: 20,
        multiplier: 3,
        icon: 'building',
        purchased: false,
        unlocked: false,
        tier: 2
    }
]; 