# Agentic Architecture Patterns — Reference

Source: "A Senior Engineer's Concern That Revealed the Most Important Role in Tech Right Now"
by Han HELOIR YAN, Ph.D. — Feb 2026, Data Science Collective (Medium)
https://medium.com/data-science-collective/i-just-watch-ai-write-code-all-day-f0f3fad2d857

Captured: 2026-03-28. Full article read via authenticated Medium session.

---

## Core Thesis

The bottleneck has shifted from model capability to everything around the model. The models can reason, use tools, and generate code. What's missing is the architecture: what to write, when, how to verify, and what to do when it fails.

Only 11% of organizations have agentic AI in production. Most failures are strategy failures, not model failures.

---

## Three Categories of Agentic Systems

### Category 1: Deterministic Workflows with LLM Intelligence

You can draw the flowchart before the system runs. The architect designs the path; the LLM adds intelligence within each step but doesn't choose the path.

- Testable, auditable, cost-predictable, debuggable
- 80%+ of production value lives here today
- Five composable patterns (see below)

### Category 2: Autonomous Agents

The structure of the work is unknown until runtime. The planning IS the work.

- Expensive, non-deterministic, hard to test, difficult to audit
- Justified when: open-ended exploration, software development/debugging, high-value low-volume decisions
- Pure Category 2 in production is rare — almost always wrapped in a Category 3 shell

### Category 3: Hybrid (Workflow Shell + Agent Core)

Predictable outer structure with pockets of bounded autonomy. What most mature production systems actually look like.

- Workflow layer provides structure, manages transitions, handles failures, enforces budgets
- Agent layer provides intelligence within specific steps, bounded by token budgets, time limits, tool restrictions
- "The highway determines the overall route, the driver navigates within it"

### Decision Heuristic

1. **Can you draw the flowchart?** -> Category 1
2. **Is task decomposition itself the hard part?** -> Category 2
3. **Need predictable structure with pockets of exploration?** -> Category 3
4. **When in doubt, start with Category 1.** You can always add agent flexibility later. You cannot easily add structure to a system that started without it.

### Uncomfortable Truth

Most teams apply Category 2 solutions to Category 1 problems. They build autonomous agent architectures for tasks that could be handled by a prompt chain with a validation gate.

---

## Five Workflow Patterns (Category 1)

### 1. Prompt Chaining
Sequential steps where each LLM call processes the output of the previous. Key addition: programmatic validation checkpoints (gates) between steps.
- When it wins: task cleanly decomposes into fixed subtasks, willing to trade latency for accuracy
- When it doesn't: dynamic planning needed, steps unknown in advance

### 2. Routing
Classify input and direct to specialized handler. Enables separation of concerns and cost optimization (simple queries hit cheap models).
- When it wins: distinct categories with different handling needs, classification is reliable
- When it doesn't: all inputs need same processing

### 3. Parallelization
Multiple LLM operations simultaneously. Two flavors:
- **Sectioning**: independent subtasks in parallel
- **Voting**: same task multiple times for diverse perspectives/higher confidence
- When it wins: genuinely independent subtasks, need higher confidence than single call

### 4. Orchestrator-Workers
Central LLM breaks down tasks and delegates to workers. Critical difference from parallelization: subtasks aren't predefined — the orchestrator determines them at runtime.
- When it wins: can't predict subtasks in advance, number/nature varies by input
- Cost predictability starts to break down here

### 5. Evaluator-Optimizer
Feedback loop: one LLM generates, another evaluates with specific criteria and actionable feedback. Iterates until quality threshold met.
- When it wins: clear evaluation criteria, iterative refinement measurably improves output
- Stopping conditions matter — without limits, loops burn tokens indefinitely

### Composing Patterns
No production system uses a single pattern in isolation. Real architectural skill is knowing how to compose them. Rule: start with simplest pattern that works, add layers only when you can measure the improvement.

---

## Durable Execution

If your agentic system can't survive a crash, it's a demo, not a product.

- Category 1: Straightforward — each step becomes a durable activity
- Category 2: Critical — these agents run longest and cost most when they fail
- Category 3: Natural fit — the workflow shell IS the durability layer

Key insight: "Deterministic" doesn't mean "predetermined." Given the same event history, the workflow must make the same decisions. But the agent can take completely different paths depending on what the LLM decides.

---

## Protocols

### MCP (Model Context Protocol)
Standardizes how agents connect to tools. Now governed by Linux Foundation. Vertical layer — every agent uses it to access tools.

### A2A (Agent-to-Agent Protocol)
Google's protocol for agent-to-agent communication. Horizontal layer — agents use it to collaborate. Features: Agent Cards (capability advertisement), Tasks (lifecycle management), Artifacts (result sharing).

MCP and A2A are complementary, not competing.

---

## Security: OWASP Agentic Top 10

Key risks for architects:
- **Agent Goal Hijack (ASI01)**: Hidden prompts in documents redirect agent objectives
- **Tool Misuse (ASI02)**: Agents use legitimate tools in unintended ways. Restrict tool access per workflow step.
- **Supply Chain Vulnerabilities (ASI04)**: Malicious MCP servers. Verify provenance.
- **Cascading Failures (ASI08)**: False signals propagate through pipelines with escalating impact
- **Rogue Agents (ASI10)**: Agents acting beyond scope. Behavioral monitoring needed.

Overarching principle: **Least agency.** Only grant agents the minimum autonomy required. Every architectural decision is ultimately a security decision.

---

## Observability

Three-layer approach:
1. **Distributed tracing** (OpenTelemetry) — agent runs as traces with spans per step
2. **Continuous evaluation** — LLM-as-a-Judge for quality scoring, evaluation flywheel from production traces
3. **Metrics and alerting** — latency per step, token consumption, tool call success rates, task completion rates, evaluation scores over time

Key metrics to instrument per agent run: latency per step, token consumption per trace, tool call success rates, task completion rates by category, evaluation scores over time.
