const fs = require('fs');
const SwaggerParser = require('@apidevtools/swagger-parser');

// Function to check if an operation has explicit security requirements
const isUnauthenticated = (operation) => {
    // Treat any endpoint without an explicit 'security' block as a candidate for unauthenticated testing.
    return !operation.security || operation.security.length === 0;
};

module.exports = async (filePath, baseUrl) => {
    // use SwaggerParser to dereference and validate the spec first
    const api = await SwaggerParser.dereference(filePath);
    
    // Use the provided base URL or the first one from the spec
    const finalBaseUrl = baseUrl || (api.servers && api.servers[0] ? api.servers[0].url : '');
    if (!finalBaseUrl) {
        throw new Error("Could not determine base URL. Please provide one with --base-url.");
    }

    const endpoints = [];

    for (const pathKey in api.paths) {
        const pathObj = api.paths[pathKey];

        for (const method in pathObj) {
            const operation = pathObj[method];

            if (isUnauthenticated(operation)) {
                const urlPath = `${finalBaseUrl.replace(/\/$/, '')}${pathKey}`;
                const cleanedUrl = urlPath.replace(/([^:]\/)\/+/g, '$1'); 

                endpoints.push({
                    url: cleanedUrl,
                    method: method.toUpperCase(),
                    pathKey: pathKey,
                    parameters: operation.parameters || [],
                    testParams: {}, 
                });
            }
        }
    }
    return endpoints;
};