const axios = require('axios');

// Simple regexes for demonstration
const SENSITIVE_REGEXES = {
    'Email': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    'AWS Key': /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    'Phone Number (US)': /\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b/g,
    'Address': /\b\d+\s+(?:[A-Za-z]+\s*){1,3}(?:Street|St|Avenue|Ave|Road|Rd|Blvd|Lane|Ln)\b/g
};

const checkSensitiveData = (body) => {
    const findings = [];
    for (const [name, regex] of Object.entries(SENSITIVE_REGEXES)) {
        if (body.match(regex)) {
            findings.push(name);
        }
    }
    return findings;
};

const checkIdorPotential = (pathKey, statusCode, body) => {
    // If the path contains a path parameter that looks like a direct ID, flag it.
    const hasPathId = /\/\{(\w+id|\w+ID|\w+Num)\}/i.test(pathKey);
    
    // And, if the request was successful (200, 201) and returned data.
    const isSuccessful = statusCode >= 200 && statusCode < 300;

    return hasPathId && isSuccessful;
};

// Rate Limit Check (This is very simplified) 
const checkRateLimit = async (url, method) => {
    const requestCount = 5; 
    const requests = Array(requestCount).fill(0).map(() => 
        axios({ 
            method, 
            url, 
            validateStatus: (status) => true,
            timeout: 500 
        }).catch(e => ({ status: 'NETWORK_ERROR' }))
    );

    const responses = await Promise.all(requests);
    
    // Check if *any* response was a 429 (Too Many Requests) or a 403/401/503 (which could imply protection)
    const gotProtectedStatus = responses.some(res => 
        [429, 403, 401, 503].includes(res.status)
    );
    
    // If we didn't get a protected status, it's potentially vulnerable.
    return !gotProtectedStatus; 
};


module.exports = {
    checkSensitiveData,
    checkIdorPotential,
    checkRateLimit,
};