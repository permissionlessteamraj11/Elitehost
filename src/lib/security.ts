import crypto from 'crypto';

import { db } from './db/json-db';

/**
 * Security utility for scanning deployment payloads for malicious patterns.
 */

const MALICIOUS_PATTERNS = [
  // Crypto mining
  'minergate', 'nanopool', 'nicehash', 'stratum+tcp', 'cryptonight', 'xmrig', 'cpuminer',
  // Reverse shells / Malicious commands
  'nc -e /bin/sh', 'nc -e /bin/bash', 'python -c "import socket', 'perl -e \'use Socket', 'bash -i >& /dev/tcp/', '0>&196;exec 196<>/dev/tcp/',
  // Suspicious process names/scripts
  'payload.sh', 'exploit.py', 'backdoor', 'malware', 'virus.exe', 'trojan',
  // SSTI Patterns
  '{{', '${', '<%=', '#{', '{%',
  // Command Injection
  '; rm -rf', '&& rm -rf', '| rm -rf', '`rm -rf`', '$(rm -rf)', '; sudo', '&& sudo', '| sudo',
  // SQL Injection patterns
  'UNION SELECT', 'UNION ALL SELECT', 'OR 1=1', 'DROP TABLE', 'INSERT INTO', 'UPDATE users SET', 'SLEEP(', 'BENCHMARK(',
  // XSS patterns
  '<script', 'javascript:', 'onload=', 'onerror=', 'eval(',
  // Dangerous commands
  'wget ', 'curl ', 'powershell', 'base64', 'chmod 777', 'chown root',
  // AWS / Secret Leaks
  'AKIA', 'SECRET_KEY', 'AWS_ACCESS_KEY', 'xoxp-', 'xoxb-', 'ghp_', 'gho_', 'glpat-'
];

export async function logSecurityEvent(ip: string, eventType: string, details: any) {
    try {
        const dbTyped = db as any;
        if (dbTyped.security_logs) {
            await dbTyped.security_logs.insert({
                ip,
                eventType,
                details,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Failed to log security event:', error);
    }
}

export function scanForMaliciousCode(payload: any): { isSafe: boolean; reason?: string; pattern?: string } {
  const contentToScan = JSON.stringify(payload).toLowerCase();

  for (const pattern of MALICIOUS_PATTERNS) {
    if (contentToScan.includes(pattern.toLowerCase())) {
      return {
        isSafe: false,
        pattern: pattern,
        reason: `Suspicious pattern detected: ${pattern}. Deployment blocked for security review.`
      };
    }
  }

  // Check for suspicious build/deploy commands
  const commands = [payload.build_command, payload.deploy_command].filter(Boolean);
  for (const cmd of commands) {
    const lowerCmd = cmd.toLowerCase();
    if (lowerCmd.includes('curl') && (lowerCmd.includes('| sh') || lowerCmd.includes('| bash'))) {
      return {
        isSafe: false,
        pattern: 'curl | sh',
        reason: 'Piping curl to shell is restricted for security reasons.'
      };
    }
    if (lowerCmd.includes('wget') && (lowerCmd.includes('| sh') || lowerCmd.includes('| bash'))) {
        return {
          isSafe: false,
          pattern: 'wget | sh',
          reason: 'Piping wget to shell is restricted for security reasons.'
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
