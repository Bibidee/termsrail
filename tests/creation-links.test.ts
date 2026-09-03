import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolveActionId,resolveServiceId,assertSuccessfulExecution} from '../lib/genlayer';

describe('canonical creation links',()=>{
 it('resolves and renders the canonical service ID without claiming verification',()=>{const rows=['{"service_key":"new-service","id":17}'];expect(resolveServiceId(rows,'new-service')).toBe(17);const source=readFileSync('app/services/new/page.tsx','utf8');expect(source).toContain('OPEN SERVICE →');expect(source).toContain('/service/${canonicalId}');expect(source).toContain('CANONICAL STATE FOUND · EXECUTION VERIFICATION STILL SYNCING')});
 it('resolves and renders the nested canonical action ID without claiming verification',()=>{const rows=['{"id":23,"service_id":"11","spec":{"action_key":"new-action","action_type":"API_CALL"}}'];expect(resolveActionId(rows,'new-action')).toBe(23);const source=readFileSync('app/action/new/page.tsx','utf8');expect(source).toContain('OPEN ACTION →');expect(source).toContain('/action/${canonicalId}');expect(source).toContain('CANONICAL STATE FOUND · EXECUTION VERIFICATION STILL SYNCING')});
 it('accepts only FINISHED_WITH_RETURN as verified and preserves explicit failure',()=>{expect(()=>assertSuccessfulExecution('FINISHED_WITH_RETURN')).not.toThrow();expect(()=>assertSuccessfulExecution('FINISHED_WITH_ERROR')).toThrow('FINISHED_WITH_ERROR');expect(()=>assertSuccessfulExecution(undefined)).toThrow('UNKNOWN')});
});
