console.log("Parcoursup Saver Background Script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background: Received request for admission stats");
    
    if (request.action === "fetchAdmissionStats") {
        console.log("Background: Fetching stats for", request.formationUrl);
        
        fetchAdmissionStatistics(request.formationUrl)
            .then(stats => {
                if (stats && stats.candidates_applied) {
                    console.log("Background: Successfully fetched stats", stats);
                    sendResponse({ success: true, data: stats });
                } else {
                    console.log("Background: No stats found");
                    sendResponse({ success: false, error: "No statistics found" });
                }
            })
            .catch(error => {
                console.error("Background: Error fetching stats", error);
                sendResponse({ success: false, error: error.message });
            });
        
        return true; 
    }
});

async function fetchAdmissionStatistics(formationUrl) {
    console.log("🔄 Fetching admission statistics from:", formationUrl);
    
    try {
        const response = await fetch(formationUrl, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log("📄 HTML length:", html.length);
        
        // Extract statistics from HTML
        return extractAdmissionStats(html);
        
    } catch (error) {
        console.error("❌ Error fetching formation page:", error);
        return null;
    }
}

function extractAdmissionStats(html) {
    console.log("🔍 Extracting admission statistics from HTML...");
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const text = doc.body.textContent || doc.body.innerText;
    
    const patterns = [
        { 
            regex: /(\d+)\s*candidats ont postulé/,
            key: 'candidates_applied' 
        },
        { 
            regex: /(\d+)\s*candidats ont pu recevoir une proposition d'admission/,
            key: 'candidates_accepted' 
        },
        { 
            regex: /(\d+)\s*candidats ont choisi d'intégrer cette formation/,
            key: 'candidates_who_accepted_offer' 
        }
    ];
    
    const stats = {
        year: 2025,
        candidates_applied: 0,
        candidates_accepted: 0,
        candidates_who_accepted_offer: 0
    };
    
    let foundAny = false;
    for (const pattern of patterns) {
        const match = text.match(pattern.regex);
        if (match) {
            const number = parseInt(match[1]);
            stats[pattern.key] = number;
            console.log(`✅ Found ${pattern.key}: ${number}`);
            foundAny = true;
            
            const index = text.indexOf(match[0]);
            const context = text.substring(Math.max(0, index - 50), Math.min(text.length, index + 150));
            console.log("   Context:", context.replace(/\n/g, ' ').substring(0, 100) + '...');
        }
    }
    
    if (foundAny) {
        console.log("🎯 Statistics extracted:", stats);
        return stats;
    }
    
    console.log("❌ No admission statistics found in the page");
    return null;
}