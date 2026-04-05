# SimBench: A Scalable Platform for Training and Evaluating Autonomous Web Agents on 100+ Deterministic Website Simulations

**Authors:** Rahul Sulegaokar et al.

**Abstract**

We introduce SimBench, a scalable platform for training and evaluating autonomous web agents across 100+ high-fidelity, deterministic simulations of popular real-world websites. While existing benchmarks like REAL (Garg et al., 2025), WebArena (Zhou et al., 2024), and BrowserGym (Chezelles et al., 2025) provide evaluation environments, they are fundamentally limited to outcome-only assessment -- offering binary pass/fail rewards computed only at task completion. SimBench addresses the critical gap between evaluation and training by introducing: (1) dense, shaped reward signals at every interaction step, (2) a 10-stage curriculum learning system with progressive difficulty and prerequisite tracking, (3) a dual-mode agent interface supporting both high-speed REST API interaction (1-5ms/step) for reinforcement learning training loops and realistic browser-based interaction via Playwright for faithful evaluation, (4) four task types including action, retrieval, combined, and impossible-task recognition, and (5) a modular site plugin architecture that enables any Next.js website clone to integrate with the shared simulation engine. Our initial release includes a comprehensive Shopify Admin simulation with 104 tasks across 8 domains, with plans to scale to 100+ website simulations across 15 categories. SimBench is publicly deployed on Vercel, requires zero infrastructure setup, and provides a Gymnasium-compatible Python SDK for seamless integration with any RL framework. We release the platform, task suite, SDK, and leaderboard to accelerate research in autonomous web agents.

---

## 1. Introduction

Large language models (LLMs) have demonstrated remarkable advances in reasoning capabilities, yet autonomous web agents built on these models consistently fail at reliable, multi-step web interactions (Xu et al., 2024; Li and Waldo, 2024). The best-performing agents achieve only 41% success on the REAL benchmark (Garg et al., 2025), underscoring the significant gap between current capabilities and practical deployment.

A key bottleneck is the lack of environments designed for agent *training*, not just evaluation. Current web agent benchmarks -- REAL, WebArena, VisualWebArena, WorkArena, MiniWoB++ -- share a common limitation: they provide binary outcome rewards (success or failure) computed only when the agent signals task completion. This evaluation-only paradigm is fundamentally misaligned with modern reinforcement learning, which requires dense reward signals, reproducible episodes, and high-throughput interaction loops to learn effectively.

The problem is analogous to the state of robotic manipulation research before MuJoCo (Todorov et al., 2012) and OpenAI Gym (Brockman et al., 2016). Before these platforms, researchers could evaluate whether a robot arm grasped an object, but they couldn't efficiently train policies through millions of iterations. Gymnasium provided the standard interface (`reset`, `step`, `observe`, `reward`) that made RL training practical. **No equivalent exists for web agents.**

We address this gap with SimBench, a platform that provides:

1. **100+ deterministic website simulations (planned)** spanning e-commerce, communication, travel, productivity, social media, finance, healthcare, and developer tools -- each built with modern web frameworks (React, Next.js) and realistic mock data.

2. **A dual-mode agent interface** that supports both REST API interaction (1-5ms per step, enabling millions of training steps per hour) and Playwright browser interaction (for realistic evaluation with screenshots and accessibility trees). Both modes share the same underlying state and evaluation engine.

3. **Dense, shaped reward signals** including per-step penalties, partial credit on weighted evaluation checks, intermediate feedback via mid-episode evaluation, and configurable reward profiles per task. This is a direct response to REAL's acknowledged limitation of "currently limited to only outcome rewards" (Garg et al., 2025, Section 9).

4. **A 10-stage curriculum learning system** with progressive difficulty, prerequisite tracking, and mastery gates. Agents start with navigation basics and progress through single-field updates, entity creation, multi-step workflows, and expert-level cross-domain scenarios. No existing web agent benchmark provides curriculum learning.

5. **Four task types** covering the full spectrum of agent capabilities: action tasks (state modification), retrieval tasks (information gathering evaluated by LLM judge), combined tasks, and impossible tasks where the agent must recognize failure conditions rather than hallucinate success.

6. **A modular site plugin architecture** where any Next.js website clone can integrate with the shared simulation engine by implementing a standard interface. This enables the community to contribute new website simulations without rebuilding infrastructure.

7. **Configurable environment conditions** including simulated network latency, error injection, accessibility feature toggling, data presets, and site-specific behavior flags -- enabling systematic study of agent robustness.

---

## 2. Motivation and Related Work

### 2.1 Limitations of Existing Benchmarks

We identify five critical limitations across current web agent benchmarks:

**Evaluation-only design.** REAL (Garg et al., 2025), WebArena (Zhou et al., 2024), VisualWebArena (Koh et al., 2024a), and WorkArena (Drouin et al., 2024) are designed to *evaluate* agent capabilities, not to *train* them. They provide binary outcome rewards and offer no mechanism for progressive learning, reward shaping, or high-throughput RL training loops. REAL's own paper acknowledges this: "While the current version of REAL provides binary outcome rewards, the underlying framework components are flexible enough to support the definition and use of dense, step-wise reward functions for reinforcement learning" (Section 4.3). We build on this observation by implementing what they describe as future work.

**Low site count and shallow task coverage.** REAL provides 11 websites with an average of ~10 tasks per site. WebArena provides 5 self-hosted environments. This shallow coverage means agents cannot develop deep competency in any single domain. Real-world Shopify store management, for example, involves hundreds of distinct workflows across products, orders, customers, inventory, discounts, marketing, analytics, and settings. Ten tasks cannot capture this complexity.

**High interaction latency.** Browser-based benchmarks require 100-500ms per agent action (rendering, network, screenshot capture). For RL training requiring millions of steps, this translates to weeks of wall-clock time per training run. No existing benchmark offers a lightweight API mode for fast iteration.

**No curriculum structure.** All existing benchmarks present tasks as flat, unordered lists. An agent attempting "complete a multi-step checkout with address changes" (hard) gains nothing from having mastered "navigate to the product page" (easy). Curriculum learning -- proven effective in RL (Bengio et al., 2009) and recently applied to web agents via WebRL (Qi et al., 2025) -- is absent from every major web agent benchmark.

**No impossible task testing.** REAL is the only benchmark that includes "no-action" tasks designed to be impossible. This is a critical capability -- agents that cannot recognize failure will hallucinate success in production. Most benchmarks ignore this entirely.

### 2.2 Web Agents and Post-Training

The emerging paradigm for improving web agents is post-training via reinforcement learning (Chen et al., 2025; DeepSeek-AI et al., 2025; Putta et al., 2024). Systems like AgentQ (Putta et al., 2024) use MCTS with self-critique, WebRL (Qi et al., 2025) uses self-evolving curriculum, and WebDreamer (Gu et al., 2025) simulates action outcomes for speculative planning. All require dense reward signals and high-throughput training environments -- exactly what SimBench provides.

### 2.3 Positioning

SimBench occupies a unique position in the landscape:

| | MiniWoB++ | WebArena | REAL | **SimBench** |
|---|---|---|---|---|
| Year | 2018 | 2024 | 2025 | 2025 |
| Sites | 100 (toy) | 5 | 11 | **100+ (planned)** |
| Tasks | 100 | 812 | 112 | **104 (v0.1)** |
| Fidelity | Low | Medium | High | **High** |
| Training support | None | None | None | **Full RL** |
| Rewards | Sparse | Binary | Binary | **Dense + shaped** |
| Curriculum | No | No | No | **Yes (10 stages)** |
| API mode | N/A | N/A | N/A | **REST (1-5ms)** |
| Deployment | Local | Docker | Vercel | **Vercel** |

---

## 3. SimBench Architecture

### 3.1 Simulation Engine

SimBench's core contribution is a **site-agnostic simulation engine** that provides episode management, state snapshots, differential evaluation, reward computation, and curriculum tracking. Each website simulation plugs into this engine via a standard interface, inheriting all training and evaluation infrastructure automatically.

The engine consists of six components:

**Episode Manager** controls the lifecycle of agent-environment interactions. An episode begins with `POST /api/sim/config` specifying a task ID, seed, and mode. The engine resets the site's state, applies any task-specific setup actions, captures an initial snapshot, and returns an episode ID. During interaction, every agent action is logged with timestamps and rewards. Episodes end via `POST /api/sim/finish`, which captures the final snapshot, computes the state diff, runs all evaluation checks, and returns a scored result.

**Snapshot Engine** captures deep-cloned copies of the entire site state at episode boundaries. State diffs are computed at field-level granularity, identifying exactly which entities were added, removed, or modified. Unlike REAL's approach using Redux middleware and IndexedDB with chunked Lambda uploads, SimBench uses a simple JSON deep-clone of the site's state singleton -- eliminating framework dependencies and external service requirements.

**Evaluator Engine** supports six check types: `state_diff` (field value comparison), `state_exists` (entity presence), `state_absent` (entity absence), `state_count` (collection cardinality), `state_predicate` (custom function evaluation), and `retrieval` (LLM-judged text response). Partial credit is computed based on per-check weights, enabling nuanced scoring of partially-correct agent behavior.

**LLM Judge** evaluates retrieval tasks using structured rubrics. Each retrieval task specifies a ground truth answer, acceptable variations, and a detailed rubric. The judge assesses correctness and completeness against the rubric, returning a binary score with reasoning.

**Config System** implements two-level configurability: universal parameters (latency, error rate, accessibility toggles, date override, locale) and site-specific parameters (e.g., out-of-stock products in Shopify, payment failure rates in Amazon). Configurations are applied per-episode, enabling systematic study of agent robustness across conditions.

**Curriculum Manager** organizes tasks into 10 progressive stages, from navigation basics through expert cross-domain workflows. Prerequisite tracking ensures agents build foundational skills before attempting complex tasks. A mastery gate (configurable threshold, default 80% over 3 runs) controls stage advancement.

### 3.2 Site Plugin Interface

Any Next.js website simulation can join SimBench by implementing a standard interface:

```typescript
interface SitePlugin {
  id: string;                              // "shopify-admin"
  name: string;                            // "Shopify Admin Dashboard"
  category: string;                        // "e-commerce-admin"
  getState(): Record<string, unknown>;     // Full state snapshot
  setState(state: Record<string, unknown>): void;
  reset(seed?: number): void;              // Deterministic reset
  getMutations(): MutationDefinition[];    // Available REST actions
  executeMutation(name: string, args: unknown): MutationResult;
  getConfigSchema(): ConfigSchema;         // Site-specific config options
  applyConfig(config: Record<string, unknown>): void;
}
```

This modular design means the simulation engine never needs to know about Shopify's products or Gmail's inbox -- it operates on generic state snapshots and task definitions. New sites inherit episode management, evaluation, curriculum, SDK support, and leaderboard integration automatically.

### 3.3 Dual-Mode Agent Interface

**REST Mode (Fast Training).** Agents interact via `POST /api/rl` with semantic action objects (e.g., `{"action": "update_product", "productId": "1", "fields": {"price": "34.99"}}`). The server returns observations, shaped rewards, and termination signals. Latency: 1-5ms per step. This enables training runs with millions of steps in hours rather than weeks.

**Browser Mode (Realistic Evaluation).** Agents receive a Playwright `Page` object connected to the live Next.js application. Observations include screenshots, accessibility trees, full DOM, or Chrome DevTools Protocol access. Actions are standard browser primitives: `click(selector)`, `fill(selector, value)`, `scroll()`, `navigate(url)`. Both modes modify the same underlying state store, so the evaluation engine produces identical scores regardless of interaction mode.

This dual-mode design addresses a fundamental tension in web agent research: RL training requires fast, API-level interaction, but realistic evaluation requires browser-level fidelity. SimBench provides both through a single platform.

### 3.4 Reward System

SimBench provides four types of reward signals:

1. **Step penalty** (-0.01 per step) encouraging efficiency
2. **Action validity penalty** (-0.1 for invalid actions) discouraging random exploration
3. **Intermediate evaluation** (via `POST /api/sim/evaluate`) allowing agents to check progress mid-episode
4. **Completion reward** (weighted sum of eval checks x completion bonus) with partial credit

Each task defines a `reward_profile` specifying the completion bonus, whether partial credit is awarded, and penalty magnitudes. This enables researchers to experiment with different reward shaping strategies.

---

## 4. Task Design

### 4.1 Task Types

**Action Tasks** require the agent to modify the environment's state. Evaluation uses programmatic state-diff checking against expected outcomes. Example: "Create a new product named 'Bamboo Water Bottle' priced at $24.99 with tags 'eco-friendly' and 'hydration'." Evaluation checks: product exists with correct title, price, and tags.

**Retrieval Tasks** require the agent to navigate the environment, locate specific information, and report it. Evaluation uses an LLM judge with a task-specific rubric. Example: "What is the total revenue from orders placed in the last 7 days?" The agent must navigate to analytics or orders, compute the answer, and submit it.

**Combined Tasks** require both state modification and information retrieval. Example: "Find the most expensive product, apply a 20% discount to it, and report the new price." Both the state change and the reported answer are evaluated.

**Impossible Tasks** present goals that cannot be achieved given the current state. The agent must recognize the impossibility and report it rather than hallucinating success. Example: "Refund order #1036" when the order is already refunded. Evaluation checks that the agent's response acknowledges the impossibility. This directly addresses a key failure mode identified in REAL: "agents often fail to assess whether they have successfully completed all parts of the task" (Garg et al., 2025, Section 8.1).

### 4.2 Task Difficulty and Curriculum

Tasks are organized into 10 progressive stages:

| Stage | Focus | Example | Steps |
|-------|-------|---------|-------|
| 1 | Navigation | Navigate to the orders page | 5 |
| 2 | Single reads | Find the price of product X | 10 |
| 3 | Single writes | Update a product's price | 15 |
| 4 | Entity creation | Create a new customer | 20 |
| 5 | Order operations | Fulfill an order, capture payment | 20 |
| 6 | Multi-field edits | Create a product with all fields | 30 |
| 7 | Search and filter | Find all unfulfilled orders over $100 | 25 |
| 8 | Error recognition | Attempt an impossible task | 15 |
| 9 | Multi-step workflows | Create product, add to collection, set discount | 40 |
| 10 | Cross-domain expert | Complex merchant scenario with ambiguity | 60 |

### 4.3 Configurable Environments

Following REAL's approach, SimBench supports two-level configuration:

**Universal parameters:**
- `latency`: Simulated network delay (0-5000ms)
- `hide_aria_labels`: Remove ARIA attributes to test agent accessibility dependence
- `error_rate`: Random action failure probability (0.0-1.0)
- `date_override`: Lock current date for determinism
- `locale`: Language and region settings

**Site-specific parameters** (example for Shopify):
- `out_of_stock_products`: Product IDs with zero inventory
- `payment_failure_rate`: Probability of payment capture failing
- `discount_expired`: Force all discounts to expired status
- `shipping_delayed`: Show delayed shipping notices

---

## 5. Python SDK

SimBench provides a Gymnasium-compatible Python SDK:

```python
import simbench

# Standard Gymnasium interface
env = simbench.make("shopify-admin", task_id="products-001", mode="rest")
obs, info = env.reset()

done = False
while not done:
    action = my_agent.decide(obs)
    obs, reward, terminated, truncated, info = env.step(action)
    done = terminated or truncated

result = env.finish()
print(f"Score: {result['score']}, Steps: {result['steps']}")

# Curriculum training
runner = simbench.CurriculumRunner("http://localhost:3000", mastery_threshold=0.8)
for stage_result in runner.run(my_agent):
    print(f"Stage {stage_result['stage']}: {stage_result['avg_score']:.0%}")
    if not stage_result['mastery_achieved']:
        break

# Multi-site evaluation (planned)
# suite = simbench.BenchmarkSuite(sites=["shopify-admin", "linear", "gmail"])
# results = suite.evaluate(my_agent, mode="browser")
# suite.submit_to_leaderboard(results, agent_name="MyAgent-v1")
```

The SDK handles connection management, observation formatting, action validation, and result collection. It supports integration with Stable-Baselines3, CleanRL, RLlib, and any framework that accepts a `gym.Env`.

---

## 6. Website Simulations

### 6.1 Design Principles

Each SimBench website simulation follows five design principles:

1. **High fidelity.** Simulations use the same component libraries as the real sites (e.g., Shopify Polaris, Material UI) with realistic layouts, data, and interactions.

2. **Full determinism.** All data is static, dates are locked, and random behavior is seeded. Identical task configurations produce identical initial states.

3. **Pre-authenticated.** Sites operate in a logged-in state, eliminating authentication flows that add noise without testing meaningful agent capabilities.

4. **Rich state.** Each site has sufficient mock data to support complex queries (e.g., 12+ products, 10+ orders, 10+ customers for Shopify) with realistic relationships between entities.

5. **Modular plugins.** Each site implements the SitePlugin interface, keeping site-specific logic isolated and enabling independent development and testing.

### 6.2 Initial Release: Shopify Admin

Our initial release focuses on a comprehensive Shopify Admin simulation built with @shopify/polaris React components. It includes:

- 39 admin pages across 9 sections (Products, Orders, Customers, Marketing, Discounts, Content, Markets, Analytics, Settings)
- Full CRUD operations for products, orders, customers, and discounts
- Order workflow actions: fulfill, capture payment, refund, add notes
- Realistic mock data: 12 products, 10 orders, 10 customers, 6 discounts
- 14 REST API actions with shaped rewards
- 104 tasks across 8 domains and 10 curriculum stages

### 6.3 Planned Releases

Phase 2 adds 10 consumer-facing sites (Amazon, Gmail, Airbnb, LinkedIn, Uber, Google Calendar, DoorDash, Stripe Dashboard, GitHub, Zillow). Phase 3 scales to 50+ sites with community contributions. Phase 4 targets 100+ sites with automated task generation.

---

## 7. Evaluation Framework

### 7.1 Metrics

SimBench reports multiple metrics per evaluation:

- **Task Success Rate (TSR)**: Percentage of tasks with score = 1.0 (comparable to REAL Score)
- **Partial Score**: Average weighted score across all eval checks (captures near-misses)
- **Step Efficiency**: Average steps used / max steps allowed
- **Curriculum Progress**: Highest stage achieved with mastery
- **Error Recognition Rate**: Accuracy on impossible tasks

### 7.2 Leaderboard

SimBench hosts a public leaderboard with per-site and aggregate scores. Submissions include agent name, model, interaction mode (REST/browser), and per-task results. This enables direct comparison across agent architectures.

---

## 8. Discussion and Future Work

**Training vs. evaluation.** SimBench's key contribution is bridging the gap between evaluation benchmarks and training environments. By providing dense rewards, curriculum learning, and a fast REST API mode, we enable the RL training loops that current benchmarks cannot support. We believe this will accelerate the development of agents that learn from experience rather than relying solely on pre-trained LLM capabilities.

**Scalability.** The site plugin architecture is designed for community contribution. We aim to release a site development kit (SDK) that streamlines the process of creating new simulations, including task template generators, evaluation harness scaffolds, and mock data synthesizers.

**Limitations.** Our current implementation uses in-memory state singletons, which means concurrent episodes on the same deployment are not isolated. Production deployment will require per-session state isolation. Additionally, our REST API mode, while fast, does not test visual understanding -- browser mode is necessary for evaluating vision-language model agents.

**Future directions.** We plan to: (1) implement cross-site workflows (e.g., find a flight on United, then add it to Google Calendar), (2) add adversarial task generation using LLMs, (3) support multi-agent scenarios, and (4) integrate with agent post-training frameworks like AgentQ and WebRL.

---

## 9. Conclusion

SimBench represents a fundamental shift from evaluation-only web agent benchmarks to a training-first platform. By targeting 100+ deterministic website simulations with dense reward signals, curriculum learning, dual-mode interaction, and a Gymnasium-compatible SDK, we give frontier AI labs the infrastructure to train web agents through reinforcement learning at scale. Our initial Shopify Admin simulation demonstrates the depth achievable with this approach -- 104 tasks across 8 domains and 10 curriculum stages in a single site. We release SimBench as an open platform and invite the research community to contribute new website simulations, tasks, and agent baselines.

---

## References

Bengio, Y., Louradour, J., Collobert, R., and Weston, J. Curriculum learning. ICML, 2009.

Brockman, G., Cheung, V., Pettersson, L., Schneider, J., Schulman, J., Tang, J., and Zaremba, W. OpenAI Gym. arXiv:1606.01540, 2016.

Chen, K., et al. Reinforcement learning for long-horizon interactive LLM agents. arXiv:2502.01600, 2025.

Chezelles, T. L. S., et al. The BrowserGym ecosystem for web agent research. arXiv:2412.05467, 2025.

DeepSeek-AI, et al. DeepSeek-R1: Incentivizing reasoning capability in LLMs via reinforcement learning. arXiv:2501.12948, 2025.

Drouin, A., et al. WorkArena: How capable are web agents at solving common knowledge work tasks? 2024.

Garg, D., et al. REAL: Benchmarking autonomous agents on deterministic simulations of real websites. arXiv:2504.11543, 2025.

Gu, Y., et al. Is your LLM secretly a world model of the internet? arXiv:2411.06559, 2025.

Koh, J. Y., et al. VisualWebArena: Evaluating multimodal agents on realistic visual web tasks. arXiv:2401.13649, 2024a.

Li, E. and Waldo, J. Websuite: Systematically evaluating why web agents fail. arXiv:2406.01623, 2024.

Putta, P., et al. Agent Q: Advanced reasoning and learning for autonomous AI agents. arXiv:2408.07199, 2024.

Qi, Z., et al. WebRL: Training LLM web agents via self-evolving online curriculum reinforcement learning. arXiv:2411.02337, 2025.

Todorov, E., Erez, T., and Tassa, Y. MuJoCo: A physics engine for model-based control. IROS, 2012.

Xu, F. F., et al. Theagentcompany: Benchmarking LLM agents on consequential real-world tasks. arXiv:2412.14161, 2024.

Zhou, S., et al. WebArena: A realistic web environment for building autonomous agents. ICLR, 2024.
