import {spawnSync} from 'node:child_process';
const args=['--yes','genlayer','write','0xb099EdF98923b92D73c70B9EEA30B42A64673B82','register_service','--args','termsrail-demo','TermsRail Demo','termsrail.example','["https://example.com"]','["TERMS_OF_SERVICE"]','86400'];
const r=spawnSync('npx.cmd',args,{stdio:'inherit'}); process.exit(r.status??1);
