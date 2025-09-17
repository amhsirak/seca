# 🛡️ Seca: The API Risk Scout

**Seca** is a lightweight, opinionated command-line interface (CLI) tool designed to quickly audit unauthenticated endpoints defined in an OpenAPI (Swagger) specification for common, critical security vulnerabilities.

By simulating basic, high-volume, and data-access requests, it helps developers identify potential risks such as **IDOR (Insecure Direct Object Reference)**, **PII/Secret Data Leaks**, and **Brute-Force/Denial-of-Service (DoS) vulnerabilities** due to missing Rate Limits.

Note that this is a very initial version and may not cover many security cases yet.

## Features

  * **OpenAPI/Swagger Compatibility:** Parses standard v3.0 specs (JSON or YAML).
  * **Unauthenticated Endpoint Filtering:** Focuses only on endpoints that explicitly lack security definitions.
  * **IDOR Potential Check:** Flags path-based parameters that look like object IDs (e.g., `/users/{userId}`).
  * **Sensitive Data Leak Detection:** Scans response bodies for common patterns of PII (Email, Phone) and Secrets (AWS Keys).
  * **Rate Limit Vulnerability Testing:** Performs rapid parallel requests to detect endpoints that do not enforce throttling.
  * **Configurable Concurrency:** Allows setting a maximum concurrent request rate to control scan speed and load on the target API.


## Getting Started

### Prerequisites

You need **Node.js** (v18+) and **npm** installed on your system.

### 1\. Installation

Clone this repository and install the dependencies:

```bash
git clone [YOUR_REPO_URL] api-risk-scout
cd api-risk-scout
npm install
```

### 2\. Prepare the Target API

Ensure the target API you wish to scan is running. For testing, you can use the included `mock-server.js`:

```bash
node mock-server.js
# Mock API listening at http://localhost:3000
```

### 3\. Run the Scan

Execute the CLI tool with the path to your spec file and the base URL of the running API:

```bash
node cli.js -s [PATH_TO_SPEC].yaml -b [API_BASE_URL]
```

**Example (Using the provided test files):**

```bash
node cli.js -s test-api.yaml -b http://localhost:3000/v1
```

-----

## Usage

The `cli.js` script accepts the following arguments:

| Option | Shorthand | Description | Required | Example |
| :--- | :--- | :--- | :--- | :--- |
| `--spec` | `-s` | Path to the OpenAPI/Swagger YAML or JSON file. | **Yes** | `-s ./my-api-spec.yaml` |
| `--base-url` | `-b` | Base URL for the target API. | **Yes** | `-b https://api.prod.com` |
| `--rate` | `-r` | Maximum concurrent requests limit (Default: 5). | No | `-r 10` |

### Sample Output

The output will be a detailed table summarizing the findings for each endpoint:

```
================================================
       API Risk Scout Scan Report
================================================
┌────────┬──────────────────────────────┬──────────┬────────────────────────────────────────────────────────────┐
│ Method │ Endpoint                     │ Status   │ Risk Findings                                              │
├────────┼──────────────────────────────┼──────────┼────────────────────────────────────────────────────────────┤
│ GET    │ /v1/status                   │ ✅ 200    │ 🟡 Rate Limit VULNERABLE                                   │
├────────┼──────────────────────────────┼──────────┼────────────────────────────────────────────────────────────┤
│ GET    │ /v1/users/1                  │ ✅ 200    │ 🔴 Secrets/PII: Email, AWS Key, Address                    │
│        │                              │          │ 🟠 IDOR Potential (Direct ID in path)                      │
│        │                              │          │ 🟡 Rate Limit VULNERABLE                                   │
└────────┴──────────────────────────────┴──────────┴────────────────────────────────────────────────────────────┘

--- Summary ---
Endpoints Tested: 3
Endpoints with CRITICAL Findings (PII/IDOR): 1
-----------------
```

-----

## Future Enhancements
  * **Authenticated Scan Mode:** Add support for JWTs or API keys to test endpoints requiring authorization.
  * **Fuzzer Integration:** Incorporate light fuzzing for input validation checks.
  * **Custom Regex/Secret Definitions:** Allow users to define their own sensitive data patterns.
  * **Structured Output:** Support JSON or SARIF output for better integration with reporting tools.
  * **Expanded Risk Categories:** Adding checks for CORS misconfigurations and HTTP verb tampering.
