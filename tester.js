const axios = require('axios');
const risks = require('./risks'); 

// Helper function to resolve parameter paths for IDOR testing
const resolvePath = (url, endpoint) => {
    let resolvedUrl = url;
    // Simple logic to replace path parameters (e.g., {userId}) with a test value '1'
    endpoint.parameters.filter(p => p.in === 'path').forEach(p => {
        resolvedUrl = resolvedUrl.replace(`{${p.name}}`, '1'); 
    });
    return resolvedUrl;
};

const testEndpoint = async (endpoint) => {
    const testUrl = resolvePath(endpoint.url, endpoint);
    
    const result = {
        url: testUrl,
        method: endpoint.method,
        statusCode: 'PENDING',
        risks: {
            rateLimitVulnerable: false,
            idorPotential: false,
            sensitiveData: [],
            error: null,
        }
    };

    try {
        const response = await axios({
            method: endpoint.method,
            url: testUrl,
            headers: { 'Content-Type': 'application/json' },
            validateStatus: (status) => true, // Do not throw on 4xx/5xx status codes
            timeout: 5000 
        });

        result.statusCode = response.status;
        
        const responseBody = JSON.stringify(response.data || {});
        result.risks.sensitiveData = risks.checkSensitiveData(responseBody);
        result.risks.idorPotential = risks.checkIdorPotential(endpoint.pathKey, response.status, responseBody);
        result.risks.rateLimitVulnerable = await risks.checkRateLimit(testUrl, endpoint.method);

        return result;

    } catch (error) {
        result.statusCode = 'ERROR';
        result.risks.error = error.message;
        
        return result;
    }
};

module.exports.runTests = async (endpoints, rateLimit) => {
    const { default: limit } = await import('p-limit'); 
    
    const limiter = limit(rateLimit);
    const promises = endpoints.map(endpoint => limiter(() => testEndpoint(endpoint)));
    return Promise.all(promises);
};