import { Draft, produce } from "immer";
import { useState } from "react";

export function useMutableState<TState>(initialState: TState) {
  const [state, setState] = useState(initialState);

  return [
    state,
    (producer: (draft: Draft<TState>) => void) => {
      setState((s) => produce(s, producer));
    },
  ] as const;
}
