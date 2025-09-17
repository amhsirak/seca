const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const parseSpec = require('./spec-parser');
const tester = require('./tester');
const reporter = require('./reporter');

const program = new Command();

program
    .version('1.0.0')
    .description('Seca, The API Risk Scout: Scan OpenAPI/Swagger specs for unauthenticated vulnerabilities.')
    .requiredOption('-s, --spec <path>', 'Path to the OpenAPI/Swagger JSON or YAML file.')
    .option('-b, --base-url <url>', 'Base URL for the API (e.g., http://localhost:3000/v1).')
    .option('-r, --rate <limit>', 'Max concurrent requests (rate limit).', '5')
    .action(async (options) => {
        try {
            const specPath = path.resolve(options.spec);
            if (!fs.existsSync(specPath)) {
                throw new Error(`Spec file not found at: ${specPath}`);
            }

            console.log(`\n🔍 Starting scan of spec: ${options.spec}`);

            const endpoints = await parseSpec(specPath, options.baseUrl);
            console.log(`✨ Found ${endpoints.length} unauthenticated endpoints to test.`);

            const results = await tester.runTests(endpoints, parseInt(options.rate));

            reporter.report(results);

        } catch (error) {
            console.error('\n🚨 Scan Failed:', error.message);
            process.exit(1);
        }
    });

program.parse(process.argv);