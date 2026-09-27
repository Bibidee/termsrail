import {describe,it,expect,vi,afterEach} from 'vitest';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/genlayer-rpc/route';

describe('public GenLayer RPC proxy',()=>{
  afterEach(()=>vi.unstubAllGlobals());
  it('forwards SDK read and gas methods',async()=>{
    const fetchMock=vi.fn().mockResolvedValue(new Response('{"jsonrpc":"2.0","id":1,"result":"0x1"}',{status:200,headers:{'content-type':'application/json'}}));
    vi.stubGlobal('fetch',fetchMock);
    const response=await POST(new NextRequest('http://localhost/api/genlayer-rpc',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'gen_call',params:[{}]})}));
    expect(response.status).toBe(200);expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('blocks wallet signing and arbitrary simulator methods',async()=>{
    const fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);
    for(const method of ['eth_sendTransaction','personal_sign','sim_fundAccount','sim_cancelTransaction','wallet_requestSnaps']){
      const response=await POST(new NextRequest('http://localhost/api/genlayer-rpc',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params:[]})}));
      expect(response.status).toBe(403);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('rejects malformed, batched, and oversized requests',async()=>{
    const fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);
    for(const body of ['[]','{"jsonrpc":"1.0","method":"gen_call"}',`{"jsonrpc":"2.0","method":"gen_call","params":["${'x'.repeat(1024*1024)}"]}`]){
      const response=await POST(new NextRequest('http://localhost/api/genlayer-rpc',{method:'POST',headers:{'content-type':'application/json'},body}));
      expect([400,413]).toContain(response.status);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
