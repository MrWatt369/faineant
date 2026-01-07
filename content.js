console.log("Parcoursup Saver: Extension chargée");

const DEBUG_MODE = false;

function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log(...args);
    }
}

const addedButtons = new Set();

function injectButtons() {
    debugLog("Recherche des coeurs...");
    
    const hearts = document.querySelectorAll("button[title*='Ajouter la formation'], button[class*='btn-favoris'], button[class*='icon-appreciation']");
    
    debugLog(`${hearts.length} coeurs trouvés`);
    
    hearts.forEach((heart) => {
        if (addedButtons.has(heart)) return;
        
        if (heart.nextElementSibling && heart.nextElementSibling.classList.contains('psup-save-btn')) {
            addedButtons.add(heart);
            return;
        }

        const saveBtn = document.createElement("button");
        saveBtn.className = "psup-save-btn";
        
        setInitialButtonState(saveBtn, heart);
        
        saveBtn.style.cssText = `
            background: #2563eb; 
            color: white; 
            border: none; 
            width: 28px; 
            height: 28px; 
            border-radius: 50%; 
            cursor: pointer; 
            margin-left: 8px; 
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all 0.2s;
            vertical-align: middle;
        `;

        saveBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const schoolInfo = extractSchoolInfoFromHeart(heart);
            
            saveBtn.innerHTML = "⏳";
            saveBtn.style.background = "#f59e0b";
            
            try {
                const formationUrl = extractFormationUrl(heart);
                
                if (formationUrl) {
                    const response = await fetch(formationUrl, { credentials: 'include' });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const html = await response.text();
                    
                    const stats = extractStatsFromHTML(html);
                    if (stats) {
                        schoolInfo.admissionStats = stats;
                    }
                    
                    const fraisScolarite = extractTuitionFeesFromHTML(html);
                    if (fraisScolarite && (fraisScolarite.etudiantsReguliers || fraisScolarite.etudiantsBoursiers)) {
                        schoolInfo.fraisScolarite = fraisScolarite;
                    }
                }
            } catch (error) {
                console.error("Erreur:", error);
            }
            
            toggleSchool(schoolInfo, saveBtn);
        };

        heart.parentNode.insertBefore(saveBtn, heart.nextSibling);
        addedButtons.add(heart);
        
        console.log("Bouton d'enregistrement ajouté");
    });
}

function extractTuitionFeesFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const text = doc.body.textContent || doc.body.innerText;
    
    const fraisScolarite = {
        etudiantsReguliers: null,
        etudiantsBoursiers: null
    };
    
    const patternRegulier = /Par année[\s\S]*?(?=Par année pour les étudiants boursiers|Contribution Vie|$)/i;
    const matchRegulier = text.match(patternRegulier);
    
    if (matchRegulier) {
        fraisScolarite.etudiantsReguliers = matchRegulier[0]
            .replace(/\s+/g, ' ')
            .replace(/\s*€\s*/g, ' € ')
            .replace(/\s*\(\s*/g, ' (')
            .replace(/\s*\)\s*/g, ') ')
            .trim();
    }
    
    const patternBoursier = /Par année pour les étudiants boursiers[\s\S]*?(?=Contribution Vie|Par année|$)/i;
    const matchBoursier = text.match(patternBoursier);
    
    if (matchBoursier) {
        fraisScolarite.etudiantsBoursiers = matchBoursier[0]
            .replace(/\s+/g, ' ')
            .replace(/\s*€\s*/g, ' € ')
            .replace(/\s*\(\s*/g, ' (')
            .replace(/\s*\)\s*/g, ') ')
            .trim();
    }
    
    if (!fraisScolarite.etudiantsReguliers) {
        const autreMatch = text.match(/Par année[^]*?\d+ €/i);
        if (autreMatch) {
            fraisScolarite.etudiantsReguliers = autreMatch[0]
                .replace(/\s+/g, ' ')
                .replace(/\s*€\s*/g, ' € ')
                .trim();
        }
    }
    
    if (!fraisScolarite.etudiantsBoursiers) {
        const autreMatch = text.match(/étudiants boursiers[^]*?\d+/i);
        if (autreMatch) {
            fraisScolarite.etudiantsBoursiers = autreMatch[0]
                .replace(/\s+/g, ' ')
                .trim();
        }
    }
    
    return fraisScolarite;
}

function extractFormationUrl(heart) {
    let container = heart;
    
    for (let i = 0; i < 3; i++) {
        container = container.parentElement;
        if (!container) break;
        
        if (container.classList && container.classList.contains('fr-card__content')) {
            break;
        }
    }
    
    if (!container) return null;
    
    const formationLinks = container.querySelectorAll('a[href*="g_ta_cod="]');
    
    if (formationLinks.length > 0) {
        return formationLinks[0].href;
    }
    
    return null;
}

function extractSchoolInfoFromHeart(heart) {
    const heartTitle = heart.getAttribute('title');
    let fullText = "";
    
    if (heartTitle) {
        const universityRegex = /à '([^']+(?:'[^']+)*)' aux favoris/;
        const formationRegex = /formation '([^']+(?:'[^']+)*)' à/;
        
        const universityMatch = heartTitle.match(universityRegex);
        const formationMatch = heartTitle.match(formationRegex);
        
        if (universityMatch && formationMatch) {
            let university = universityMatch[1].trim();
            let formation = formationMatch[1].trim();
            
            let cleanUniversity = university.replace(/\s*\([^)]+\)\s*$/, '').trim();
            let diploma = formation;
            
            return {
                university: cleanUniversity,
                diploma: diploma,
                fullText: `${cleanUniversity} – ${diploma}`
            };
        }
    }
    
    let container = heart;
    for (let i = 0; i < 3; i++) {
        container = container.parentElement;
        if (!container) break;
        
        if (container.classList && container.classList.contains('fr-card__content')) {
            const link = container.querySelector('a[href*="g_ta_cod="]');
            if (link) {
                const linkText = link.textContent.trim();
                const lines = linkText.split('\n').map(line => line.trim()).filter(line => line);
                
                if (lines.length >= 2) {
                    const university = lines[0].replace(/\s*\([^)]+\)\s*$/, '').trim();
                    const diploma = lines[1].replace(/^[–-]\s*/, '').trim();
                    
                    return {
                        university: university,
                        diploma: diploma,
                        fullText: `${university} – ${diploma}`
                    };
                }
            }
            break;
        }
    }
    
    try {
        const card = heart.closest('.fr-card');
        if (card) {
            const title = card.querySelector('.fr-card__title');
            if (title) {
                const titleText = title.textContent.trim();
                const parts = titleText.split(/[\n–-]/).map(p => p.trim()).filter(p => p);
                if (parts.length >= 2) {
                    const university = parts[0].replace(/\s*\([^)]+\)\s*$/, '').trim();
                    const diploma = parts.slice(1).join(' - ').trim();
                    
                    return {
                        university: university,
                        diploma: diploma,
                        fullText: `${university} – ${diploma}`
                    };
                }
            }
        }
    } catch (e) {
        console.error("Erreur d'extraction:", e);
    }
    
    return {
        university: "Université inconnue",
        diploma: "Formation inconnue",
        fullText: "Formation inconnue"
    };
}

function setInitialButtonState(button, heart) {
    const schoolInfo = extractSchoolInfoFromHeart(heart);
    
    chrome.storage.local.get({ savedSchools: [] }, (result) => {
        const isSaved = result.savedSchools.some(s => 
            s.university === schoolInfo.university && s.diploma === schoolInfo.diploma
        );
        
        if (isSaved) {
            button.innerHTML = "✓";
            button.style.background = "#059669";
            button.title = "Retirer de la liste (avec statistiques et frais)";
        } else {
            button.innerHTML = "+";
            button.style.background = "#2563eb";
            button.title = "Ajouter à la liste avec statistiques et frais de scolarité";
        }
    });
}

function extractStatsFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const text = doc.body.textContent || doc.body.innerText;
    
    const patterns = [
        { 
            regex: /(\d+)\s*candidats ont postulé/,
            key: 'candidatsPostules' 
        },
        { 
            regex: /(\d+)\s*candidats ont pu recevoir une proposition d'admission/,
            key: 'candidatsAcceptes' 
        },
        { 
            regex: /(\d+)\s*candidats ont choisi d'intégrer cette formation/,
            key: 'candidatsInscrits' 
        }
    ];
    
    const stats = {
        annee: 2025,
        candidatsPostules: 0,
        candidatsAcceptes: 0,
        candidatsInscrits: 0
    };
    
    let trouve = false;
    for (const pattern of patterns) {
        const match = text.match(pattern.regex);
        if (match) {
            const nombre = parseInt(match[1]);
            if (pattern.key === 'candidatsPostules') stats.candidatsPostules = nombre;
            else if (pattern.key === 'candidatsAcceptes') stats.candidatsAcceptes = nombre;
            else if (pattern.key === 'candidatsInscrits') stats.candidatsInscrits = nombre;
            trouve = true;
        }
    }
    
    if (trouve) {
        stats.tauxAdmission = stats.candidatsAcceptes > 0 ? 
            `${((stats.candidatsAcceptes / stats.candidatsPostules) * 100).toFixed(1)}%` : "0%";
        stats.tauxInscription = stats.candidatsInscrits > 0 ? 
            `${((stats.candidatsInscrits / stats.candidatsPostules) * 100).toFixed(1)}%` : "0%";
        stats.ratioCompetition = stats.candidatsAcceptes > 0 ? 
            (stats.candidatsPostules / stats.candidatsAcceptes).toFixed(1) : "N/A";
        
        return stats;
    }
    
    return null;
}

function toggleSchool(schoolInfo, button) {
    chrome.storage.local.get({ savedSchools: [] }, (result) => {
        const schools = result.savedSchools || [];
        const index = schools.findIndex(s => 
            s.university === schoolInfo.university && s.diploma === schoolInfo.diploma
        );
        
        if (index >= 0) {
            schools.splice(index, 1);
            chrome.storage.local.set({ savedSchools: schools }, () => {
                button.innerHTML = "+";
                button.style.background = "#2563eb";
                button.title = "Ajouter à la liste avec statistiques et frais de scolarité";
                showNotification(`${schoolInfo.university} retiré`);
            });
        } else {
            const schoolEntry = { 
                id: Date.now(),
                university: schoolInfo.university,
                diploma: schoolInfo.diploma,
                date: new Date().toLocaleDateString('fr-FR'),
                timestamp: new Date().toISOString(),
                fullText: schoolInfo.fullText
            };
            
            if (schoolInfo.admissionStats) {
                schoolEntry.admissionStats = schoolInfo.admissionStats;
            }
            
            if (schoolInfo.fraisScolarite) {
                schoolEntry.fraisScolarite = schoolInfo.fraisScolarite;
            }
            
            schools.push(schoolEntry);
            
            chrome.storage.local.set({ savedSchools: schools }, () => {
                button.innerHTML = "✓";
                button.style.background = "#059669";
                button.title = "Retirer de la liste (avec statistiques et frais)";
                
                let message = `${schoolInfo.university} enregistré`;
                if (schoolInfo.admissionStats) message += ' avec statistiques';
                if (schoolInfo.fraisScolarite) message += ' et frais de scolarité';
                
                showNotification(message);
            });
        }
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #059669;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 99999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

const style = document.createElement('style');
style.textContent = `
    .psup-save-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
    }
    
    .psup-save-btn[title*="Retirer"] {
        background: #059669 !important;
    }
`;
document.head.appendChild(style);

function scanPage() {
    debugLog("Analyse de la page...");
    injectButtons();
}

setTimeout(scanPage, 3000);

setInterval(scanPage, 5000);

const observer = new MutationObserver(() => {
    setTimeout(scanPage, 1000);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});