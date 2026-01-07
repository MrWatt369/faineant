document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('list');
    const exportBtn = document.getElementById('export');
    const clearBtn = document.getElementById('clear');
    const toggleAllBtn = document.createElement('button');
    
    toggleAllBtn.textContent = "Tout développer/réduire";
    toggleAllBtn.id = "toggleAll";
    toggleAllBtn.style.cssText = `
        background: #8b5cf6;
        color: white;
        border: none;
        padding: 10px;
        width: 100%;
        cursor: pointer;
        margin-top: 8px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 13px;
    `;
    
    document.querySelector('body').insertBefore(toggleAllBtn, exportBtn);
    
    const style = document.createElement('style');
    style.textContent = `
        body {
            width: 450px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
            padding: 16px;
            margin: 0;
            background: #f9fafb;
        }
        
        h3 {
            margin-top: 0;
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            font-size: 16px;
        }
        
        #list {
            max-height: 500px;
            overflow-y: auto;
            margin-bottom: 16px;
        }
        
        button {
            background: #059669;
            color: white;
            border: none;
            padding: 10px;
            width: 100%;
            cursor: pointer;
            margin-top: 8px;
            border-radius: 6px;
            font-weight: 500;
            transition: background-color 0.2s;
            font-size: 13px;
        }
        
        button:hover {
            background: #047857;
        }
        
        #clear {
            background: #dc2626;
        }
        
        #clear:hover {
            background: #b91c1c;
        }
        
        #toggleAll:hover {
            background: #7c3aed;
        }
        
        .formation-item {
            background: white;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .formation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            padding: 8px 0;
        }
        
        .formation-nom {
            font-weight: 600;
            font-size: 14px;
            color: #1f2937;
            line-height: 1.3;
            flex: 1;
        }
        
        .formation-diplome {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.3;
            margin-top: 4px;
        }
        
        .taux-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            margin-right: 10px;
            background: #2563eb;
            color: white;
            min-width: 60px;
            text-align: center;
        }
        
        .taux-eleve { background: #059669; }
        .taux-moyen { background: #d97706; }
        .taux-faible { background: #dc2626; }
        .taux-inconnu { background: #6b7280; }
        
        .fleche-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #6b7280;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: transform 0.2s;
        }
        
        .fleche-btn:hover {
            background: #f3f4f6;
        }
        
        .formation-details {
            padding-top: 12px;
            border-top: 1px dashed #e5e7eb;
            margin-top: 8px;
            display: none;
        }
        
        .details-visible {
            display: block;
        }
        
        .stats-section {
            font-size: 11px;
            color: #4b5563;
            margin-bottom: 12px;
        }
        
        .titre-section {
            font-weight: 600;
            color: #374151;
            margin-bottom: 6px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .ligne-stat {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
        }
        
        .frais-section {
            font-size: 11px;
            color: #4b5563;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px dashed #e5e7eb;
        }
        
        .texte-frais {
            font-size: 11px;
            line-height: 1.4;
            margin-bottom: 6px;
            padding: 6px 8px;
            background: #f8fafc;
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
        }
        
        .texte-boursier {
            font-size: 11px;
            line-height: 1.4;
            margin-bottom: 6px;
            padding: 6px 8px;
            background: #f0fdf4;
            border-radius: 4px;
            border-left: 3px solid #10b981;
        }
        
        .supprimer-btn {
            background: #fee2e2;
            color: #dc2626;
            border: none;
            padding: 6px 14px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            margin-top: 12px;
            width: auto;
            display: block;
        }
        
        .supprimer-btn:hover {
            background: #fecaca;
        }
        
        .date-sauvegarde {
            font-size: 10px;
            color: #9ca3af;
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 10px;
            margin-top: 8px;
            display: inline-block;
        }
        
        .aucune-donnee {
            font-size: 11px;
            color: #9ca3af;
            font-style: italic;
            text-align: center;
            padding: 12px;
            background: #f9fafb;
            border-radius: 4px;
            margin: 8px 0;
        }
        
        .etat-vide {
            text-align: center;
            padding: 40px 20px;
            color: #6b7280;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
    `;
    document.head.appendChild(style);
    
    let toutesFormationsDeveloppees = false;
    
    function chargerFormationsSauvegardees() {
        chrome.storage.local.get({ savedSchools: [] }, (result) => {
            const formations = result.savedSchools || [];
            
            if (formations.length === 0) {
                list.innerHTML = `
                    <div class="etat-vide">
                        <p style="font-size: 14px; margin-bottom: 8px;">Aucune université enregistrée</p>
                        <p style="font-size: 11px; color: #9ca3af;">
                            Parcourez Parcoursup et cliquez sur le bouton bleu <strong>+</strong> 
                            à côté des coeurs pour sauvegarder des formations
                        </p>
                    </div>
                `;
                return;
            }
            
            formations.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
            
            list.innerHTML = formations.map((formation, index) => {
                let tauxTexte = "N/A";
                let tauxClasse = "taux-inconnu";
                
                if (formation.admissionStats && formation.admissionStats.tauxAdmission) {
                    const taux = formation.admissionStats.tauxAdmission;
                    tauxTexte = taux;
                    
                    if (taux !== "N/A" && taux !== "0%") {
                        const tauxNum = parseFloat(taux);
                        if (tauxNum > 50) tauxClasse = "taux-eleve";
                        else if (tauxNum > 20) tauxClasse = "taux-moyen";
                        else tauxClasse = "taux-faible";
                    }
                }
                
                let statsHTML = '';
                if (formation.admissionStats) {
                    statsHTML = `
                        <div class="stats-section">
                            <div class="titre-section">Statistiques d'admission</div>
                            <div class="ligne-stat">
                                <span>Candidats (${formation.admissionStats.annee || 2025}):</span>
                                <span style="font-weight: 500;">${formaterNombre(formation.admissionStats.candidatsPostules)}</span>
                            </div>
                            <div class="ligne-stat">
                                <span>Acceptés:</span>
                                <span style="font-weight: 500;">${formaterNombre(formation.admissionStats.candidatsAcceptes)}</span>
                            </div>
                            <div class="ligne-stat">
                                <span>Inscrits:</span>
                                <span style="font-weight: 500;">${formaterNombre(formation.admissionStats.candidatsInscrits)}</span>
                            </div>
                            <div class="ligne-stat">
                                <span>Taux d'admission:</span>
                                <span style="font-weight: 500;">${formation.admissionStats.tauxAdmission || 'N/A'}</span>
                            </div>
                            <div class="ligne-stat">
                                <span>Taux d'inscription:</span>
                                <span style="font-weight: 500;">${formation.admissionStats.tauxInscription || 'N/A'}</span>
                            </div>
                            <div class="ligne-stat">
                                <span>Ratio de compétition:</span>
                                <span style="font-weight: 500;">${formation.admissionStats.ratioCompetition || 'N/A'}</span>
                            </div>
                        </div>
                    `;
                } else {
                    statsHTML = `
                        <div class="aucune-donnee">Aucune statistique d'admission disponible</div>
                    `;
                }
                
                let fraisHTML = '';
                if (formation.fraisScolarite) {
                    fraisHTML = `
                        <div class="frais-section">
                            <div class="titre-section">Frais de scolarité</div>
                    `;
                    
                    if (formation.fraisScolarite.etudiantsReguliers) {
                        fraisHTML += `
                            <div class="texte-frais">
                                <strong>Étudiants réguliers:</strong><br>
                                ${echapperHTML(formation.fraisScolarite.etudiantsReguliers)}
                            </div>
                        `;
                    }
                    
                    if (formation.fraisScolarite.etudiantsBoursiers) {
                        fraisHTML += `
                            <div class="texte-boursier">
                                <strong>Étudiants boursiers:</strong><br>
                                ${echapperHTML(formation.fraisScolarite.etudiantsBoursiers)}
                            </div>
                        `;
                    }
                    
                    if (!formation.fraisScolarite.etudiantsReguliers && !formation.fraisScolarite.etudiantsBoursiers) {
                        fraisHTML += `
                            <div class="aucune-donnee">Aucune information sur les frais de scolarité</div>
                        `;
                    }
                    
                    fraisHTML += `</div>`;
                }
                
                return `
                    <div class="formation-item" data-index="${index}">
                        <div class="formation-header" onclick="toggleDetails(${index})">
                            <div style="flex: 1;">
                                <div class="formation-nom">${echapperHTML(formation.university)}</div>
                                <div class="formation-diplome">${echapperHTML(formation.diploma || '')}</div>
                                <div class="date-sauvegarde">Sauvé: ${formation.date}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="taux-badge ${tauxClasse}">${tauxTexte}</span>
                                <button class="fleche-btn" id="fleche-${index}">▼</button>
                            </div>
                        </div>
                        <div class="formation-details" id="details-${index}">
                            ${statsHTML}
                            ${fraisHTML}
                            <button class="supprimer-btn" onclick="supprimerFormation(${index}, event)">Supprimer</button>
                        </div>
                    </div>
                `;
            }).join('');
            
            window.toggleDetails = function(index) {
                const details = document.getElementById(`details-${index}`);
                const fleche = document.getElementById(`fleche-${index}`);
                
                if (details.classList.contains('details-visible')) {
                    details.classList.remove('details-visible');
                    fleche.textContent = "▶";
                } else {
                    details.classList.add('details-visible');
                    fleche.textContent = "▼";
                }
            };
            
            window.supprimerFormation = function(index, event) {
                event.stopPropagation();
                if (confirm('Supprimer cette formation?')) {
                    chrome.storage.local.get({ savedSchools: [] }, (result) => {
                        const formations = result.savedSchools || [];
                        if (index >= 0 && index < formations.length) {
                            formations.splice(index, 1);
                            chrome.storage.local.set({ savedSchools: formations }, chargerFormationsSauvegardees);
                        }
                    });
                }
            };
        });
    }
    
    function formaterNombre(num) {
        if (num === undefined || num === null || isNaN(num)) return 'N/A';
        return num.toLocaleString('fr-FR');
    }
    
    function echapperHTML(texte) {
        if (!texte) return '';
        const div = document.createElement('div');
        div.textContent = texte;
        return div.innerHTML;
    }
    
    toggleAllBtn.addEventListener('click', () => {
        toutesFormationsDeveloppees = !toutesFormationsDeveloppees;
        
        const toutesFleches = document.querySelectorAll('.fleche-btn');
        const tousDetails = document.querySelectorAll('.formation-details');
        
        toutesFleches.forEach(fleche => {
            fleche.textContent = toutesFormationsDeveloppees ? "▼" : "▶";
        });
        
        tousDetails.forEach(details => {
            if (toutesFormationsDeveloppees) {
                details.classList.add('details-visible');
            } else {
                details.classList.remove('details-visible');
            }
        });
        
        toggleAllBtn.textContent = toutesFormationsDeveloppees ? "Tout réduire" : "Tout développer";
    });
    
    exportBtn.addEventListener('click', () => {
        chrome.storage.local.get({ savedSchools: [] }, (result) => {
            const formations = result.savedSchools || [];
            
            const enTetes = [
                'Université',
                'Formation', 
                'Date de sauvegarde',
                'Année',
                'Candidats postulés',
                'Candidats acceptés',
                'Candidats inscrits',
                'Taux d\'admission',
                'Taux d\'inscription',
                'Ratio de compétition',
                'Frais - Étudiants réguliers',
                'Frais - Étudiants boursiers'
            ];
            
            const lignesCSV = [];
            
            lignesCSV.push('\uFEFF' + enTetes.join(','));
            
            formations.forEach(formation => {
                const ligne = [
                    echapperCSV(formation.university || ''),
                    echapperCSV(formation.diploma || ''),
                    echapperCSV(formation.date || ''),
                    formation.admissionStats?.annee || '2025',
                    formation.admissionStats?.candidatsPostules || 'N/A',
                    formation.admissionStats?.candidatsAcceptes || 'N/A',
                    formation.admissionStats?.candidatsInscrits || 'N/A',
                    formation.admissionStats?.tauxAdmission || 'N/A',
                    formation.admissionStats?.tauxInscription || 'N/A',
                    formation.admissionStats?.ratioCompetition || 'N/A',
                    formation.fraisScolarite?.etudiantsReguliers || 'N/A',
                    formation.fraisScolarite?.etudiantsBoursiers || 'N/A'
                ];
                
                lignesCSV.push(ligne.join(','));
            });
            
            const csv = lignesCSV.join('\n');
            
            const blob = new Blob([csv], { 
                type: 'text/csv;charset=utf-8' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `parcoursup_formations_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });
    
    function echapperCSV(str) {
        if (str === null || str === undefined) return '';
        
        str = String(str).trim();
        str = str.replace(/[;,"]/g, ' ');
        
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            str = str.replace(/"/g, '""');
            return `"${str}"`;
        }
        
        return str;
    }
    
    clearBtn.addEventListener('click', () => {
        if (confirm('Effacer toutes les formations enregistrées?\nCette action est irréversible.')) {
            chrome.storage.local.set({ savedSchools: [] }, chargerFormationsSauvegardees);
        }
    });
    
    chargerFormationsSauvegardees();
    
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.savedSchools) {
            chargerFormationsSauvegardees();
        }
    });
});