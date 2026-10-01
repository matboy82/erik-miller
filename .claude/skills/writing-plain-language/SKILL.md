---
name: writing-plain-language
description: Write or edit prose for people, including onboarding, how-to guides, README files, product documentation, UI text, notices, emails, and error messages. Use when human-facing text is wordy, passive, bureaucratic, jargon-heavy, or hard to scan; preserve exact technical terms where readers need them.
---

# Writing Plain Language

Help readers find what they need, understand it the first time, and use it to complete their task.

## Audience boundary

- Use this skill for prose meant primarily for people.
- Use `/writing-for-agents` for skills, agents, rules, prompts, and agent control documents.
- For mixed-audience documents, apply both. Keep the prose plain while preserving exact commands, paths, artifact names, status values, gates, and technical terms.

## Write for the reader

- Name the actual audience and the task they need to complete.
- Put the answer or required action first.
- Address the reader as `you` when appropriate and use `we` for the team or organization.
- Separate content for different audiences instead of interleaving it.
- Explain a necessary technical term the first time; then use the same term consistently.

## Organize for use

- Put the main point before details, exceptions, and background.
- Use chronological order for procedures.
- Start sections and paragraphs with informative statements.
- Use descriptive headings; use question headings when they match the reader's task.
- Limit heading depth to three levels when practical.
- Use numbered lists only when order matters.
- Use bullets for choices, conditions, or unordered items.
- Use an if-then table when several conditions change the result.

## Prefer direct language

- Use active voice unless the actor is unknown or irrelevant.
- Use present tense when accuracy allows.
- Keep subject, verb, and object close together.
- Put one main idea in each sentence and one topic in each paragraph.
- Prefer short, familiar words: `use`, not `utilize`; `before`, not `prior to`.
- Turn hidden nouns back into verbs: `we review`, not `we conduct a review`.
- Use `must` for obligations, `must not` for prohibitions, `may` for permission, and `should` for recommendations.
- Cut filler, redundant pairs, empty intensifiers, double negatives, and long noun strings.
- Use examples for difficult concepts.

Read [word-list.md](references/word-list.md) when editing bureaucratic or heavily formal prose and a substitution guide would help.

## Keep technical meaning

- Keep domain terms, commands, code, API names, file paths, status values, and quoted errors exact.
- Do not replace a precise technical term with a familiar but incorrect synonym.
- Explain jargon that the audience may not know; do not erase distinctions the task depends on.
- Use the project's `CONTEXT.md` vocabulary when it exists.

## Check the result

Confirm that the reader can quickly answer:

1. What is this for?
2. What do I need before I start?
3. What do I do next?
4. How do I know it worked?
5. Where do I go if it did not work?
