import {readFileSync} from 'node:fs';

const canonical = '0x6a1023185e64Ae635EC9474AaF1360E89A845541';
const env = readFileSync('.env.example', 'utf8').match(/^NEXT_PUBLIC_CONTRACT_ADDRESS=(.*)$/m)?.[1]?.trim();
const source = readFileSync('lib/genlayer.ts', 'utf8').match(/FROZEN_TERMSRAIL_CONTRACT\s*=\s*'([^']+)'/)?.[1];
const docs = ['README.md', 'HANDOFF.md'].map((file) => readFileSync(file, 'utf8'));
if (env !== canonical || source !== canonical || docs.some((text) => !text.includes(canonical))) {
  console.error('Canonical TermsRail deployment references diverge.');
  process.exit(1);
}
console.log(`Canonical TermsRail deployment: ${canonical}`);
