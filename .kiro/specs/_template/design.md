# Design — `<feature name>`

## Approach

Two or three sentences on the mechanism. Name the one non-obvious technical
decision and why the obvious alternative was rejected.

## Data flow

```
source -> firecrawl extract -> normalise -> derive -> cache -> render
```

Annotate each arrow with the module that owns it.

## Types

```ts
// the shape crossing the boundary — paste the real interface
```

## Components

| Component | Responsibility | Client/Server |
|---|---|---|
| | | |

## Failure modes

| What breaks | Detection | Degradation |
|---|---|---|
| Scrape returns 0 items | length check in pipeline | fall back to `data/cache` |
| Source changed layout | schema validation fails | keep cache, surface `STALE` |
| No network at venue | fetch throws | cache, silently |
| 3D context unavailable | `webglcontextlost` | render the 2D ring fallback |

## Not doing

The tempting adjacent feature we are deliberately skipping, and why.
