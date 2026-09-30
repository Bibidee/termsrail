import {describe,expect,it,vi,beforeEach,afterEach} from 'vitest';

let fakeClient:{writeContract:()=>Promise<string>;waitForTransactionReceipt:()=>Promise<unknown>;getTransaction:()=>Promise<unknown>};
vi.mock('genlayer-js',()=>({createClient:()=>fakeClient}));
vi.mock('genlayer-js/chains',()=>({studionet:{rpcUrls:{default:{http:[]}}}}));
vi.mock('genlayer-js/types',()=>({ExecutionResult:{FINISHED_WITH_RETURN:'FINISHED_WITH_RETURN',FINISHED_WITH_ERROR:'FINISHED_WITH_ERROR'},executionResultNumberToName:{1:'FINISHED_WITH_RETURN',2:'FINISHED_WITH_ERROR'}}));

process.env.NEXT_PUBLIC_CONTRACT_ADDRESS='0x1111111111111111111111111111111111111111';
const {writeAndRead}=await import('../lib/genlayer');

describe('post-finality verification ordering',()=>{
  beforeEach(()=>vi.useFakeTimers());
  afterEach(()=>vi.useRealTimers());

  it('surfaces canonical state before delayed execution metadata without claiming verification',async()=>{
    fakeClient={
      writeContract:async()=> '0xabc',
      waitForTransactionReceipt:async()=>({status:7}),
      getTransaction:async()=>({txExecutionResultName:'FINISHED_WITH_RETURN'})
    };
    let canonicalSeen=false;
    const phases:string[]=[];
    const pending=writeAndRead('0x1111111111111111111111111111111111111111',{request:async()=>[]} as never,'register_service',[],async()=> 'canonical',()=>true,event=>phases.push(event.phase),()=>{canonicalSeen=true});
    await vi.advanceTimersByTimeAsync(0);
    expect(canonicalSeen).toBe(true);
    expect(phases).toContain('CANONICAL_STATE_FOUND');
    expect(phases).not.toContain('EXECUTION_VERIFIED');
    await vi.advanceTimersByTimeAsync(1500);
    await expect(pending).resolves.toMatchObject({state:'canonical'});
    expect(phases).toContain('EXECUTION_VERIFIED');
  });
});
