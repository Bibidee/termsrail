import nextVitals from 'eslint-config-next/core-web-vitals';
import { globalIgnores } from 'eslint/config';
const config = [...nextVitals, globalIgnores([
  '.next/**',
  '.pytest_cache/**',
  'node_modules/**',
  'submission-assets/**',
  '.venv-task/**',
  '.uv-cache-task/**',
  '.uv-python-task/**',
  'artifacts/**',
])];
export default config;
