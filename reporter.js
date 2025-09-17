const Table = require('cli-table3');

const getStatusDisplay = (result) => {
    if (result.statusCode === 'ERROR' || result.statusCode === 'PENDING') {
        return '🚨 ERROR';
    }
    const status = String(result.statusCode);
    if (status.startsWith('2')) {
        return `✅ ${status}`;
    }
    if (status.startsWith('4') || status.startsWith('5')) {
        return `⚠️ ${status}`;
    }
    return status;
};

const getRisksDisplay = (risks) => {
    if (!risks) {
        return '🚨 Error: Risks data missing';
    }
    
    if (risks.error) {
        return `🚨 Network Error: ${risks.error}`;
    }

    const findings = [];

    if (risks.sensitiveData && risks.sensitiveData.length > 0) {
        findings.push(`🔴 Secrets/PII: ${risks.sensitiveData.join(', ')}`);
    }

    if (risks.idorPotential) {
        findings.push('🟠 IDOR Potential (Direct ID in path)');
    }

    if (risks.rateLimitVulnerable) {
        findings.push('🟡 Rate Limit VULNERABLE');
    }

    if (findings.length === 0) {
        return '🟢 None Detected';
    }
    
    return findings.join('\n');
};


module.exports.report = (results) => {
    console.log('\n================================================');
    console.log('       API Risk Scout Scan Report');
    console.log('================================================');

    const table = new Table({
        head: ['Method', 'Endpoint', 'Status', 'Risk Findings'],
        colWidths: [8, 30, 10, 60],
        style: { 
            head: ['cyan'], 
            border: ['gray'] 
        }
    });

    results.forEach(result => {
        const endpointDisplay = result.url.replace(/^(https?:\/\/[^\/]+)/, ''); 
        
        table.push([
            result.method,
            endpointDisplay,
            getStatusDisplay(result),
            getRisksDisplay(result.risks),
        ]);
    });

    console.log(table.toString());
    
    const criticalFindings = results.filter(r => 
        r.risks && (r.risks.sensitiveData.length > 0 || r.risks.idorPotential)
    ).length;

    console.log(`\n--- Summary ---`);
    console.log(`Endpoints Tested: ${results.length}`);
    console.log(`Endpoints with CRITICAL Findings (PII/IDOR): ${criticalFindings}`);
    console.log('-----------------');
};