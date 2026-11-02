# Local country learning and practice

Current progress requires canonical schema 4, retaining the existing storage key
and completed-session history. Unsupported versions, including earlier experimental
schemas, surface a read error and block writes. No automatic history reconstruction
or v2/v3 migration is implemented. Never clear storage to bypass this protection.

Each unique answer updates correct/incorrect, first-try success, last practiced
and the last ten answer outcomes for the target country. Total attempts are derived
from correct + incorrect. Last-round guess IDs prevent repeated taps being counted
twice. Learn never records scored practice. Counters persist independently of the
last 100 completed score sessions. Mode-specific pack IDs are unchanged.

Adaptive practice uses a small weighted draw: unseen countries have weight 4;
recent misses increase weight, three first-try successes and three recent correct
answers reduce weight, and up to three points accrue over 21 days without practice.
Both modes exclude up to four recently practiced targets, capped at half the active
pool so small packs remain playable. The previous transient target takes the first
cooldown slot; remaining recency comes from existing per-mode last-practiced records,
including on reopening. Random mode uses uniform weights among the remaining targets;
Adaptive retains its weights there. Both stay inside the active difficulty pool.
Normal includes at least two thirds of each map, while Difficult includes every country.

Home exposes saved practice through its setup sheet. Profile owns selected-map
learning summaries and history, including coverage, mastery, needing-practice and
attempt accuracy. A country is mastered when at least one quiz mode has three
first-try successes and its last three outcomes are correct. This is a current
learning indicator, not proof of retention across every mode. Core learning uses
no account or backend; optional Friends publishes only a derived summary after
consent. Explorer XP derives separately from cumulative learning and discoveries.
