# Shared Codebase-Design Lens

Use this lens only when work creates or materially changes a module, public interface, dependency seam, or test surface. Follow the target repository's established architecture and vocabulary when they differ.

## Vocabulary

- **Module:** code with an interface and an implementation. Its scale may be a function, class, package, or cross-layer slice.
- **Interface:** everything a caller must know: operations, inputs, outputs, invariants, errors, ordering, configuration, and meaningful performance constraints.
- **Seam:** a place where behavior can vary without editing the caller.
- **Adapter:** a concrete implementation placed at a seam.
- **Depth:** useful behavior available through a small, coherent interface.
- **Leverage:** capability callers gain without learning internal complexity.
- **Locality:** related behavior, changes, and tests stay together.

Use repository-native terms such as service, controller, handler, component, or API where they are more precise. This vocabulary is a reasoning aid, not a rename mandate.

## Design checks

- Keep the public interface smaller and more stable than its implementation.
- Hide invariants, sequencing, error translation, and integration complexity behind the module that owns them.
- Put the test seam at the same boundary callers use when practical.
- Accept dependencies at an established seam instead of creating remote clients or infrastructure deep inside behavior.
- Return or expose observable outcomes rather than requiring tests to inspect private state.
- Use the deletion test: if deleting the module merely scatters its complexity across callers, it provides useful locality; if complexity disappears, it may be pass-through indirection.
- Do not introduce a seam for hypothetical variation. A production adapter plus a justified test substitute may establish real variation; one fixed implementation often does not.
- Prefer one cohesive module over several shallow pass-through layers, while respecting framework and repository conventions.

## Dependency choices

- **In-process:** test directly through the module interface.
- **Local substitute available:** use the real local substitute when fast and deterministic.
- **Owned remote system:** use an established port and production adapter when callers should not own transport details.
- **External system:** isolate the vendor or protocol boundary and use a focused test double.

## Planning and review

- In the developer spec, state the chosen interface, seam, dependency direction, and tests only when the change makes those decisions relevant.
- Prefer existing seams and patterns. Treat a new public abstraction as scope that requires approval.
- Offer an ADR only for a hard-to-reverse, surprising trade-off. Do not record routine framework usage as architecture.
- In review, use this lens to find unnecessary pass-through layers, leaked invariants, unstable interfaces, and tests coupled to internals. Do not block solely because a different design could also work.
