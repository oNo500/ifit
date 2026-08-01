---
name: prompt-injection-defense
description: Secure AI agents and LLM applications against prompt injection, jailbreaks, indirect data tampering, and instruction override attacks. Use when building guardrails, sanitizing untrusted inputs, designing dual-space separation, or auditing LLM security.
---

# Prompt Injection Defense

## Overview

Prompt injection occurs when untrusted user input or external data (web pages, emails, documents) modifies the intended behavior of a Large Language Model (LLM) by overriding system instructions. This skill provides a comprehensive methodology for architecting robust defense layers, validating untrusted data, separating control instructions from data, and establishing rigorous auditing frameworks.

---

## Core Principles & Attack Surface

1. **Privilege Separation (Control vs. Data)**: Never treat external input as executable instructions. Maintain strict structural boundaries between system prompts and user/external payloads.
2. **Least Privilege & Tool Isolation**: Restrict the capabilities of tools accessible to the agent. Destructive actions (file deletion, financial transactions, database writes) must require out-of-band authorization or human-in-the-loop (HITL) confirmation.
3. **Defense in Depth**: Assume no single defense layer is infallible (prompt injection is fundamentally unpatchable via natural language alone). Combine architectural boundaries, input sanitization, model-based guardrails, output filtering, and strict state management.
4. **Zero Trust for External Content**: Treat any content retrieved from the web, user uploads, emails, or APIs as potentially malicious.

*Note on Scope*: Following security best practices, this skill focuses on attack surface recognition and mitigation mechanics rather than providing raw exploit payloads or attack recipes.

---

## Taxonomy of Attacks & Effect Boundaries

- **Direct Prompt Injection (Jailbreaking)**:
  - *Mechanism*: The direct user attempts to bypass safety filters or system constraints via roleplay, hypothetical scenarios, or command override.
  - *Defense Boundary*: Handled primarily by system prompts, safety classifiers, and pre-screening guard models. Cannot be 100% prevented by natural language prompts alone.
- **Indirect Prompt Injection**:
  - *Mechanism*: External data (e.g., a summarized webpage, an incoming email, a retrieved PDF) contains hidden instructions designed to hijack the agent when ingested.
  - *Defense Boundary*: Requires strict data-control separation, parsing out executable tags, and treating ingested data as untrusted text rather than context instructions.
- **Goal Hijacking & Payload Smuggling**:
  - *Mechanism*: Subverting the agent's core objective while appearing to fulfill the user's initial request.
  - *Defense Boundary*: Mitigated by strict tool parameter validation, secondary guardrail models, and output inspection.
- **Dual-Use Tool Exploitation**:
  - *Mechanism*: Tricking legitimate tools into executing unauthorized commands through injected parameters.
  - *Defense Boundary*: Handled by parameter schema validation, least-privilege scoping, and Human-in-the-Loop (HITL) confirmation for sensitive actions.

---

## Six Layers of Defense & Effect Boundaries

1. **Input Isolation & Delimitation**:
   - *What it blocks*: Breakout attempts from untrusted data blocks.
   - *What it misses*:
2. **Output Handling & Inspection**:
   - *What it blocks*: Data exfiltration via markdown image loading or embedded links in agent outputs.
   - *What it misses*:
3. **Permission Minimization (Least Privilege)**:
   - *What it misses*:
4. **Sandboxing**:
   - *What it blocks*: Host OS compromise, unauthorized file access.
   - *What it misses*:
5. **Human-in-the-Loop (HITL)**:
   - *What it blocks*:
6. **Monitoring & Auditing**:
   - *What it blocks*:

*(Note on Layer Boundaries)*: Regarding sandbox layer selection and implementation details, refer to the `agent-sandbox` skill.

---

## OWASP LLM Top 10 Summary & Countermeasures

- **LLM01: Prompt Injection**: Prevented via architectural input delimitation and dual-LLM guard wrappers.
- **LLM02: Insecure Output Handling**: Prevented via strict output sanitization and escaping before rendering.
- **LLM03: Training Data Poisoning**: Handled via dataset provenance verification and filtering.
- **LLM04: Model Denial of Service**: Mitigated via token budgeting, rate limiting, and timeout controls.
- **LLM05: Supply Chain Vulnerabilities**: Monitored via dependency pinning and secure model registries.
- **LLM06: Sensitive Information Disclosure**: Handled via data masking and PII scrubbing before LLM ingestion.
- **LLM07: Insecure Plugin Design**: Mitigated via strict parameter schema validation and scoped permissions.
- **LLM08: Excessive Agency**: Controlled via fine-grained tool authorization and HITL approvals.
- **LLM09: Model Theft**: Mitigated via API gateways and rate limiting.
- **LLM10: Poisoned Model Behavior**: Checked via continuous monitoring and post-deployment alignment evaluation.

---

## Implementation Blueprint: Checklist for New LLM Applications

When designing a new LLM application, ask and verify these seven checklist items directly:

1. **Are all user inputs and external data wrapped in unique, explicit XML or Markdown delimiters?**
2. **Does the system prompt explicitly instruct the model to treat data within those delimiters as inert content rather than instructions?**
3. **Is external content (web pages, documents, API payloads) pre-screened by a secondary guard model or classifier before reaching the core agent?**
4. **Are all tool parameters strictly typed and validated against predefined schemas before execution?**
5. **Are destructive, financial, or high-impact actions gated behind Human-in-the-Loop (HITL) confirmation?**
6. **Is agent output inspected for data exfiltration attempts (such as unauthorized external URLs or encoded data in images)?**
7. **Is the agent's environment isolated using appropriate sandboxing and least-privilege permissions?**

---

## Verification & Testing

To audit your agent implementation against prompt injection:

- **Red Teaming Suites**: Use automated red-teaming frameworks (e.g., Garak, PyRIT) to probe for jailbreaks and indirect injections.
- **Indirect Injection Simulation**: Mock external data sources containing hidden instructions to verify whether the agent attempts unauthorized tool calls.
