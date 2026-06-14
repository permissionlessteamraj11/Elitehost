import crypto from 'crypto';

/**
 * Security utility for scanning deployment payloads for malicious patterns.
 */

const MALICIOUS_PATTERNS = [
  // Crypto mining
  'minergate', 'nanopool', 'nicehash', 'stratum+tcp', 'cryptonight', 'xmrig',
  // Reverse shells / Malicious commands
  'nc -e /bin/sh', 'nc -e /bin/bash', 'python -c "import socket', 'perl -e \'use Socket',
  // Suspicious process names/scripts
  'payload.sh', 'exploit.py', 'backdoor', 'malware',
  // SSTI Patterns
  '{{', '${', '<%=', '#{', '{%',
  // Command Injection
  '; rm -rf', '&& rm -rf', '| rm -rf', '`rm -rf`', '$(rm -rf)',
  // AWS / Secret Leaks
  'AKIA', 'SECRET_KEY', 'AWS_ACCESS_KEY', 'xoxp-', 'xoxb-'
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

// Encryption settings
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (!text) return '';
  if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY not set");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  if (!text) return '';
  if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY not set");
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
