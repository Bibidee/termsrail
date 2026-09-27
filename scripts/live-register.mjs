import { spawnSync } from 'node:child_process';

const [contractArg, serviceKey, name, domain, sourceUrl, role = 'TERMS_OF_SERVICE', ttlArg = '86400'] = process.argv.slice(2);
const contract = (contractArg || process.env.TERMSRAIL_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '').trim();
const usage = 'Usage: node scripts/live-register.mjs <contract-address> <service-key> <name> <domain> <public-policy-url> [TERMS_OF_SERVICE|API_TERMS|SCRAPING_POLICY|DATA_POLICY] [ttl-seconds]';

if (!/^0x[\da-f]{40}$/i.test(contract)) throw new Error(`A target contract address is required. ${usage}`);
if (![serviceKey, name, domain, sourceUrl].every(value => typeof value === 'string' && value.trim())) throw new Error(usage);
if (!/^[\w.-]{1,128}$/.test(serviceKey) || !/^[A-Za-z0-9][A-Za-z0-9 .-]{0,127}$/.test(name)) throw new Error('Service key or name contains unsupported characters.');
if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(domain)) throw new Error('Domain must be a valid hostname without a scheme or path.');
if (!['TERMS_OF_SERVICE', 'API_TERMS', 'SCRAPING_POLICY', 'DATA_POLICY'].includes(role)) throw new Error(`Unsupported source role: ${role}`);
const ttl = Number(ttlArg);
if (!Number.isSafeInteger(ttl) || ttl < 60 || ttl > 31_536_000) throw new Error('TTL must be an integer from 60 through 31536000 seconds.');
let parsedUrl;
try { parsedUrl = new URL(sourceUrl); } catch { throw new Error('Policy URL must be an absolute HTTP(S) URL.'); }
if (!['https:', 'http:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) throw new Error('Policy URL must be an absolute HTTP(S) URL without embedded credentials.');
if (!/^[A-Za-z0-9:/?=.#_~+-]+$/.test(sourceUrl)) throw new Error('Policy URL contains characters that cannot be safely passed to the CLI on Windows.');
const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
const sourceHost = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
if (sourceHost !== normalizedDomain && !sourceHost.endsWith(`.${normalizedDomain}`)) throw new Error('Policy URL hostname must match the registered service domain or one of its subdomains.');
if (/example\.(com|org|net)$/i.test(sourceHost) || /\.example$/i.test(sourceHost)) throw new Error('Placeholder example domains cannot be registered as live policy sources.');

const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['--yes', 'genlayer', 'write', contract, 'register_service', '--args', serviceKey, name, domain, JSON.stringify([sourceUrl]), JSON.stringify([role]), String(ttl)];
console.log(`Registering ${name} on ${contract}; source URL: ${sourceUrl}`);
const result = spawnSync(executable, args, { stdio: 'inherit', shell: process.platform === 'win32' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
