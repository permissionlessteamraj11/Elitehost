/**
 * Security utility for scanning deployment payloads for malicious patterns.
 */

const MALICIOUS_PATTERNS = [
  // Crypto mining
  'minergate', 'nanopool', 'nicehash', 'stratum+tcp', 'cryptonight', 'xmrig',
  // Reverse shells / Malicious commands
  'nc -e /bin/sh', 'nc -e /bin/bash', 'python -c "import socket', 'perl -e \'use Socket',
  // Suspicious process names/scripts
  'payload.sh', 'exploit.py', 'backdoor', 'malware'
];

export function scanForMaliciousCode(payload: any): { isSafe: boolean; reason?: string } {
  const contentToScan = JSON.stringify(payload).toLowerCase();

  for (const pattern of MALICIOUS_PATTERNS) {
    if (contentToScan.includes(pattern.toLowerCase())) {
      return {
        isSafe: false,
        reason: `Suspicious pattern detected: ${pattern}. Deployment blocked for security review.`
      };
    }
  }

  // Check for suspicious build/deploy commands
  const commands = [payload.build_command, payload.deploy_command].filter(Boolean);
  for (const cmd of commands) {
    if (cmd.toLowerCase().includes('curl') && cmd.toLowerCase().includes('| sh')) {
      return {
        isSafe: false,
        reason: 'Piping curl to shell is restricted for security reasons.'
      };
    }
  }

  return { isSafe: true };
}
