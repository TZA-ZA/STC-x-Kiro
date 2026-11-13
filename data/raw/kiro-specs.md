# Specs

Specs or specifications are structured artifacts that formalize the development process for features and bug fixes in your application. They provide a systematic approach to transform high-level ideas into detailed implementation plans with clear tracking and accountability.

With Kiro's specs, you can break down requirements into user stories with acceptance criteria, build design docs with sequence diagrams and architecture plans, track implementation progress across discrete tasks, and collaborate effectively between product and engineering teams.

Every spec generates three key files that form the foundation of your specification. The requirements file captures user stories, acceptance criteria, or bug analysis in structured notation. The design file documents technical architecture, sequence diagrams, and implementation considerations. The tasks file provides a detailed implementation plan with discrete, trackable tasks.

All specs follow a three-phase workflow that transforms your idea into executable implementation, which ensures the intent behind a feature is recorded before any code is written.

Kiro provides a task execution interface for tasks files that displays real-time status updates. Tasks are updated as in-progress or completed, allowing you to efficiently track implementation progress across a team.

When you run all tasks on a spec, Kiro analyzes your task list, figures out which tasks depend on each other, and runs independent tasks concurrently. For most feature specs, this cuts execution time significantly without any setup, which improves velocity without additional configuration cost.

Kiro builds a dependency graph of the tasks in your tasks file and groups independent tasks into waves. Waves execute sequentially while tasks within a wave execute concurrently, so the tooling parallelises work that a developer would otherwise serialise by hand.

For building new features and capabilities in your application, Feature Specs guide you through requirements gathering, technical design, and implementation planning with two workflow variants. For well-understood features you can also use Quick Spec to auto-generate all three artifacts without approval gates.

For systematically diagnosing and fixing bugs with surgical precision while preventing regressions, Bugfix Specs help you identify root causes, design fixes, and validate that nothing else breaks, which prevents the regression problem that unstructured prompting often introduces.

Analyze Requirements catches inconsistencies, ambiguities, and gaps in your requirements before design, so a specification problem is found early rather than after implementation.
