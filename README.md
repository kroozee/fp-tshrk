# fp-tshrk

`fp-tshrk` is a Sharks with Lasers™ bot that I made to familiarize myself with [fp-ts](https://gcanti.github.io/fp-ts/).

## Domain

> Note: Most of the shark logic is in its `brain`. See `brain/types.ts` for a type-level overview.

`SharkSee`, `SharkThink`, `SharkDo`.

The shark is born with some amount of `SharkKnowledge`. Using that, it

1. `See`s the `Situation`
1. `Think`s of what `Maneuver` to do next, and then
1. `Do`es it.

### Extensible

To extend the sharks capabilities, implement a new `Maneuver`! Simply add a new `ManeuverName` in `brain/types.ts`, and let the compiler guide you from there.

## Run (Swim?) the Shark

You will need to edit the `arenaId` and `sharkId` in `config.ts`.

TODO: docker-ize!
