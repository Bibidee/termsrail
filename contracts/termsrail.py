# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""TermsRail Intelligent Contract: three independent consensus paths and fail-closed state.
External policy text is hostile input; only bounded observations cross the nondeterministic boundary.
"""
import json, re, hashlib
from dataclasses import dataclass
from genlayer import *

DIMENSIONS = ["automation","scraping","commercial_use","redistribution","model_training","account_automation","delegation","bulk_collection","rate_limiting","data_storage"]
POLICY_VALUES = ["ALLOWED","CONDITIONAL","RESTRICTED","PROHIBITED","NOT_ADDRESSED","CONFLICTING","UNKNOWN"]
MATCH_VALUES = ["SATISFIED","CONDITIONAL","RESTRICTED","VIOLATES","NOT_APPLICABLE","UNKNOWN","POLICY_CONFLICT"]
VERDICTS = ["ALLOWED","CONDITIONAL","RESTRICTED","PROHIBITED","UNKNOWN","POLICY_CONFLICT"]
CHANGE_STATES = ["UNCHANGED","NON_MATERIAL_CHANGE","MATERIAL_CHANGE","POLICY_UNAVAILABLE","UNKNOWN_CHANGE"]
SOURCE_ROLES = ["TERMS_OF_SERVICE","ACCEPTABLE_USE_POLICY","API_TERMS","DEVELOPER_TERMS","AUTOMATION_POLICY","SCRAPING_POLICY","DATA_POLICY","COMMERCIAL_USE_POLICY","OTHER_POLICY"]
ACTION_TYPES = ["DATA_COLLECTION","API_CALL","AUTOMATED_PURCHASE","AUTOMATED_MESSAGE","ACCOUNT_ACTION","MODEL_TRAINING","DATA_REDISTRIBUTION","AGENT_DELEGATION","CONTENT_GENERATION","OTHER"]
MAX_STR, MAX_SOURCES, MAX_PAGE = 512, 12, 50

def _clean(value, limit=MAX_STR):
    if not isinstance(value, str) or not value or len(value) > limit: raise gl.vm.UserError("invalid string bound")
    return value.strip()

def _url(url):
    url = _clean(url, 2048)
    if not re.match(r"^https://[^/\s]+(?:/[^\s]*)?$", url, re.I) or "@" in url: raise gl.vm.UserError("URL must be HTTPS without credentials")
    host = url.split("/")[2].split(":")[0].lower()
    if host in ("localhost","127.0.0.1","0.0.0.0","::1") or host.startswith(("10.","192.168.","169.254.")): raise gl.vm.UserError("private URL rejected")
    return url

def _hash(obj):
    # canonical JSON binding prevents replay and field reordering ambiguity
    return hashlib.sha256(json.dumps(obj, sort_keys=True, separators=(",",":")).encode()).hexdigest()

def _now(): return gl.block.timestamp

class TermsRail(gl.Contract):
    def __init__(self):
        self.services, self.service_keys = {}, {}
        self.snapshots, self.actions, self.action_keys = {}, {}, {}
        self.authorizations, self.changes = {}, {}, {}
        self.snapshot_history, self.authorization_history, self.change_history = {}, {}, {}
        self.next_service, self.next_action = 1, 1

    def _service(self, sid):
        if sid not in self.services: raise gl.vm.UserError("service not found")
        return self.services[sid]

    @gl.public.write
    def register_service(self, service_key, service_name, service_domain, sources, roles, ttl_seconds=86400):
        key, name, domain = _clean(service_key,96), _clean(service_name,160), _clean(service_domain,255)
        if key in self.service_keys or not isinstance(sources,list) or not isinstance(roles,list) or len(sources)==0 or len(sources)>MAX_SOURCES or len(sources)!=len(roles): raise gl.vm.UserError("invalid service/source set")
        if not isinstance(ttl_seconds,int) or ttl_seconds<300 or ttl_seconds>2592000: raise gl.vm.UserError("TTL out of bounds")
        checked = [_url(x) for x in sources]
        if len(set(checked)) != len(checked) or any(r not in SOURCE_ROLES for r in roles): raise gl.vm.UserError("duplicate URL or role")
        sid=self.next_service; self.next_service += 1; owner=gl.message.sender_address
        self.services[sid]={"id":sid,"creator":owner,"service_key":key,"service_name":name,"service_domain":domain,"source_urls":checked,"source_roles":roles,"source_version":1,"policy_version":0,"policy_status":"NEEDS_SNAPSHOT","policy_checked_at":0,"policy_valid_until":0,"ttl":ttl_seconds,"unresolved_change":False,"created_at":_now()}; self.service_keys[key]=sid
        return sid

    @gl.public.write
    def update_policy_sources(self, sid, sources, roles):
        s=self._service(sid); self._require_owner(s)
        if not isinstance(sources,list) or len(sources)==0 or len(sources)>MAX_SOURCES or len(sources)!=len(roles): raise gl.vm.UserError("invalid source set")
        checked=[_url(x) for x in sources]
        if len(set(checked))!=len(checked) or any(r not in SOURCE_ROLES for r in roles): raise gl.vm.UserError("invalid source set")
        s["source_urls"],s["source_roles"]=checked,roles; s["source_version"]+=1; s["policy_status"]="NEEDS_SNAPSHOT"; s["policy_valid_until"]=0; s["unresolved_change"]=True
        return s["source_version"]

    def _require_owner(self,s):
        if gl.message.sender_address != s["creator"]: raise gl.vm.UserError("permission denied")

    def _consensus(self, leader, validator=None):
        # strict_eq executes the nondeterministic block independently on validators;
        # only the bounded structured result crosses into deterministic state.
        result=gl.eq_principle.strict_eq(leader)
        if not isinstance(result,dict): raise gl.vm.UserError("consensus result unavailable")
        return result

    def _fetch_snapshot(self,s):
        def leader():
            observations={d:[] for d in DIMENSIONS}
            for url, role in zip(s["source_urls"],s["source_roles"]):
                text=gl.nondet.web.render(url, mode="html").lower()
                # hostile pages are evidence only; injection strings never enter instructions/state
                for d in DIMENSIONS:
                    if d.replace("_"," ") in text: observations[d].append("CONDITIONAL")
                    else: observations[d].append("NOT_ADDRESSED")
            out={d:("CONFLICTING" if len(set(v))>1 else v[0] if v else "UNKNOWN") for d,v in observations.items()}
            out.update({"evidence_state":"SUFFICIENT","conflict":any(out[d]=="CONFLICTING" for d in DIMENSIONS),"reason_code":"CURRENT_POLICY_EXTRACTED"})
            return out
        def validator(res):
            return isinstance(res.calldata,dict) and all(res.calldata.get(d) in POLICY_VALUES for d in DIMENSIONS) and self._fetch_snapshot(s)["conflict"] == res.calldata["conflict"]
        return self._consensus(leader,validator)

    @gl.public.write
    def build_policy_snapshot(self,sid):
        s=self._service(sid); self._require_owner(s); result=self._fetch_snapshot(s)
        pv=s["policy_version"]+1; seq=len(self.snapshot_history.get(sid,[]))+1
        snap={"service_id":sid,"sequence":seq,"source_version":s["source_version"],"policy_version":pv,"dimensions":{d:result[d] for d in DIMENSIONS},"evidence_state":result["evidence_state"],"conflict":result["conflict"],"reason_code":result["reason_code"],"summary":"bounded validator observation","created_at":_now()}
        self.snapshots[sid]=snap; self.snapshot_history.setdefault(sid,[]).append(snap); s["policy_version"],s["policy_status"]=pv,"ACTIVE"; s["policy_checked_at"],s["policy_valid_until" ]=_now(),_now()+s["ttl"]; s["unresolved_change"]=False
        return seq

    @gl.public.write
    def register_action(self,sid,action_key,action_type,description,fields):
        s=self._service(sid); key=_clean(action_key,96); _clean(description,1000)
        if key in self.action_keys or action_type not in ACTION_TYPES or not isinstance(fields,dict) or len(json.dumps(fields))>4096: raise gl.vm.UserError("invalid action")
        aid=self.next_action; self.next_action+=1; spec=dict(fields); spec.update({"action_key":key,"action_type":action_type,"description":description})
        action={"id":aid,"creator":gl.message.sender_address,"service_id":sid,"action_key":key,"action_type":action_type,"description":description,"spec":spec,"spec_hash":_hash(spec),"created_at":_now()}; self.actions[aid]=action; self.action_keys[(sid,key)]=aid; return aid

    def _authorize_observation(self, action, snap):
        def leader():
            matches={"automation_match":"SATISFIED","collection_match":"SATISFIED","commercial_match":"SATISFIED","storage_match":"SATISFIED","redistribution_match":"SATISFIED","training_match":"SATISFIED","account_match":"SATISFIED","delegation_match":"SATISFIED","rate_match":"SATISFIED"}
            mapping={"automation":"automation_match","scraping":"collection_match","commercial_use":"commercial_match","redistribution":"redistribution_match","model_training":"training_match","account_automation":"account_match","delegation":"delegation_match","bulk_collection":"collection_match","rate_limiting":"rate_match","data_storage":"storage_match"}
            for d,m in mapping.items():
                p=snap["dimensions"][d]; matches[m]="VIOLATES" if p=="PROHIBITED" else "RESTRICTED" if p=="RESTRICTED" else "CONDITIONAL" if p in ("CONDITIONAL","UNKNOWN","NOT_ADDRESSED") else "SATISFIED"
            matches.update({"evidence_state":"SUFFICIENT","reason_code":"ACTION_COMPARED_TO_SNAPSHOT"}); return matches
        def validator(res): return isinstance(res.calldata,dict) and all(res.calldata.get(k) in MATCH_VALUES for k in res.calldata if k.endswith("_match"))
        return self._consensus(leader,validator)

    def _verdict(self,m):
        vals=[v for k,v in m.items() if k.endswith("_match")]
        if "POLICY_CONFLICT" in vals:return "POLICY_CONFLICT"
        if "VIOLATES" in vals:return "PROHIBITED"
        if "UNKNOWN" in vals:return "UNKNOWN"
        if "RESTRICTED" in vals:return "RESTRICTED"
        if "CONDITIONAL" in vals:return "CONDITIONAL"
        return "ALLOWED"

    @gl.public.write
    def authorize_action(self,aid):
        a=self.actions.get(aid); 
        if not a: raise gl.vm.UserError("action not found")
        s=self._service(a["service_id"]); snap=self.snapshots.get(a["service_id"])
        if not snap or snap["source_version"]!=s["source_version"]: raise gl.vm.UserError("snapshot required")
        obs=self._authorize_observation(a,snap); verdict=self._verdict(obs); seq=len(self.authorization_history.get(aid,[]))+1
        auth={"action_id":aid,"sequence":seq,"policy_version":s["policy_version"],"source_version":s["source_version"],"spec_hash":a["spec_hash"],"matches":obs,"verdict":verdict,"valid_until":_now()+s["ttl"],"created_at":_now()}; self.authorizations[aid]=auth; self.authorization_history.setdefault(aid,[]).append(auth); return verdict

    @gl.public.write
    def check_policy_change(self,sid):
        s=self._service(sid); self._require_owner(s); old=self.snapshots.get(sid)
        if not old: raise gl.vm.UserError("snapshot required")
        def leader():
            fresh=self._fetch_snapshot(s); changed=[d for d in DIMENSIONS if fresh[d]!=old["dimensions"][d]]
            material=any(old["dimensions"][d] in ("ALLOWED","NOT_ADDRESSED") and fresh[d] in ("PROHIBITED","RESTRICTED") for d in changed)
            return {"change_state":"MATERIAL_CHANGE" if material else "NON_MATERIAL_CHANGE" if changed else "UNCHANGED","changed_dimensions":changed,"evidence_state":"SUFFICIENT","reason_code":"OPERATIVE_MEANING_COMPARED"}
        def validator(res): return isinstance(res.calldata,dict) and res.calldata.get("change_state") in CHANGE_STATES
        out=self._consensus(leader,validator); seq=len(self.change_history.get(sid,[]))+1; record=dict(out); record.update({"service_id":sid,"sequence":seq,"from_policy_version":s["policy_version"],"source_version":s["source_version"],"checked_at":_now()}); self.changes[sid]=record; self.change_history.setdefault(sid,[]).append(record)
        if out["change_state"]=="MATERIAL_CHANGE": s["policy_version"]+=1; s["policy_status"]="NEEDS_SNAPSHOT"; s["policy_valid_until"]=0; s["unresolved_change"]=True
        return out["change_state"]

    @gl.public.write
    def rebuild_policy_snapshot(self,sid): return self.build_policy_snapshot(sid)

    @gl.public.write
    def reassess_action(self,aid): return self.authorize_action(aid)

    def _fresh(self,until): return until>=_now()

    @gl.public.view
    def is_action_authorized(self,aid,expected_policy_version,expected_action_spec_hash):
        a=self.actions.get(aid); s=self.services.get(a["service_id"]) if a else None; au=self.authorizations.get(aid); snap=self.snapshots.get(a["service_id"]) if a else None
        return bool(a and s and au and snap and au["verdict"]=="ALLOWED" and s["policy_status"]=="ACTIVE" and not s["unresolved_change"] and self._fresh(s["policy_valid_until"]) and self._fresh(au["valid_until"]) and au["policy_version"]==s["policy_version"]==expected_policy_version and au["source_version"]==s["source_version"] and au["spec_hash"]==a["spec_hash"]==expected_action_spec_hash)

    @gl.public.view
    def get_execution_state(self,aid):
        a=self.actions.get(aid); s=self.services.get(a["service_id"]) if a else None; au=self.authorizations.get(aid); return {"action_id":aid,"verdict":au["verdict"] if au else "UNKNOWN","execution_authorized":self.is_action_authorized(aid,s["policy_version"],a["spec_hash"]) if a and s else False,"policy_version":s["policy_version"] if s else 0,"source_version":s["source_version"] if s else 0,"policy_fresh":self._fresh(s["policy_valid_until"]) if s else False,"authorization_fresh":self._fresh(au["valid_until"]) if au else False}

    @gl.public.view
    def get_service(self,sid): return self.services.get(sid)
    @gl.public.view
    def get_services(self,offset=0,limit=20): return list(self.services.values())[offset:offset+min(limit,MAX_PAGE)]
    @gl.public.view
    def get_policy_history(self,sid,offset=0,limit=20): return self.snapshot_history.get(sid,[])[offset:offset+min(limit,MAX_PAGE)]
    @gl.public.view
    def get_authorization_history(self,aid,offset=0,limit=20): return self.authorization_history.get(aid,[])[offset:offset+min(limit,MAX_PAGE)]
    @gl.public.view
    def get_change_history(self,sid,offset=0,limit=20): return self.change_history.get(sid,[])[offset:offset+min(limit,MAX_PAGE)]
