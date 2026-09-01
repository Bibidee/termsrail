# TERMSRAIL — Product Brief

## One-line description
TermsRail is a consensus-backed policy execution layer that decides whether autonomous agents may perform specific actions under current third-party service policies.

## Problem
Agents increasingly operate through APIs, marketplaces, developer platforms, communication tools, content platforms and AI services. The rules governing those actions are fragmented across ToS, AUPs, API terms, automation rules, scraping policies, commercial-use clauses, redistribution rules and model-training restrictions.

An agent may know HOW to perform an action while lacking a neutral answer to whether the action is currently permitted.

## Product thesis
TermsRail turns public policy text into versioned machine-consumable state.

GenLayer validators independently inspect configured policy sources and establish bounded policy dimensions. The contract then evaluates exact structured actions, exposes a deterministic execution gate, detects policy changes, invalidates stale authorizations and requires reassessment.

## Example policy snapshot
```json
{
  "automation": "CONDITIONAL",
  "scraping": "PROHIBITED",
  "commercial_use": "ALLOWED",
  "redistribution": "PROHIBITED",
  "model_training": "RESTRICTED",
  "account_automation": "CONDITIONAL",
  "delegation": "UNKNOWN"
}
```

Example action: collect public product pages every 30 minutes, store data and redistribute commercially.

Structured authorization observation identifies violations, then deterministic code derives PROHIBITED and closes the execution gate.

## Why GenLayer is load-bearing
A deterministic contract cannot safely interpret changing natural-language service policies. A central AI service would become the authority. TermsRail uses validator consensus to create neutral shared policy state.

## Not TermsRail
Not legal advice, generic summarization, dispute resolution, escrow, prediction resolution, uptime checking, dependency lifecycle tracking, or internal code change-control.
