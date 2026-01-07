async function scrapeFormationStats(formationUrl) {
    console.log("🔍 Starting local scrape for:", formationUrl);
    
    try {
        const response = await fetchWithRetry(formationUrl);
        const html = await response.text();
        
        const stats = parseStatisticsFromHTML(html);
        
        if (stats) {
            console.log("✅ Local scrape successful:", stats);
            return stats;
        }
        
        console.log("⚠️ No statistics found on page");
        return null;
        
    } catch (error) {
        console.error("❌ Local scrape failed:", error);
        return null;
    }
}

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.ok) return response;
            
            console.log(`Attempt ${i + 1} failed: ${response.status}`);
            
        } catch (error) {
            console.log(`Attempt ${i + 1} error: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
    
    throw new Error(`Failed to fetch after ${retries} attempts`);
}

function parseStatisticsFromHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const statsSection = findStatsSection(tempDiv);
    
    if (!statsSection) return null;
    
    const text = statsSection.textContent;
    
    const patterns = {
        applied: /(\d+)[\s\n]*candidats ont postulé/i,
        accepted: /(\d+)[\s\n]*candidats ont pu recevoir une proposition d'admission/i,
        enrolled: /(\d+)[\s\n]*candidats ont choisi d'intégrer cette formation/i
    };
    
    const stats = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern);
        stats[key] = match ? parseInt(match[1]) : 0;
    }
    
    if (stats.applied > 0) {
        return {
            year: 2025,
            candidates_applied: stats.applied,
            candidates_accepted: stats.accepted,
            candidates_who_accepted_offer: stats.enrolled
        };
    }
    
    return null;
}

function findStatsSection(element) {
    const selectors = [
        '[id*="statistiques"]',
        '[class*="statistiques"]',
        '[id*="chiffres"]',
        '[class*="chiffres"]',
        'h2:contains("chiffres") + div',
        'h3:contains("chiffres") + div',
        'section:has(h2:contains("chiffres"))',
        'div:has(> h2:contains("accès"))'
    ];
    
    for (const selector of selectors) {
        try {
            const section = element.querySelector(selector);
            if (section && section.textContent.includes('candidats')) {
                return section;
            }
        } catch (e) {
        }
    }
    
    const allElements = element.querySelectorAll('*');
    for (const el of allElements) {
        if (el.textContent.includes('candidats ont postulé') && 
            el.textContent.match(/\d+/)) {
            return el;
        }
    }
    
    return null;
}