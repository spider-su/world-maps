# Local country learning and practice

Learning counters were introduced in schema 2; current progress schema 4 retains the existing storage key and completed-session history.
Missing-version data migrates valid retained sessions once into per-target,
per-mode counters; scores and voice preference are unchanged. Version 2 reads its
own counters, including misses in unfinished rounds, instead of rebuilding from
bounded score history. Future versions block writes through the existing read-error
flow rather than silently replacing data. Migration reconstructs only the history
that was retained; it cannot recover older rounds previously discarded.

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

Home shows the saved practice selector. Home and Settings show Europe coverage,
mastery, needing-practice and attempt accuracy, with an expandable country list.
A country counts as mastered when at least one quiz mode meets the displayed rule;
it is not a claim of retention across every mode or a validated learning measure.
No backend, account, or new runtime dependency is involved. Explorer XP is derived separately from cumulative learning and discoveries.
