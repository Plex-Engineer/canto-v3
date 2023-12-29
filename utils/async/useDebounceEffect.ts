import React from "react";
import _ from "lodash";

type DebounceEffect = {
  callback: () => void;
  dependencies: any[];
  timeout: number;
  // legacy callback will be called like a normal useEffect
  legacyCallback?: () => void;
};
// hook will simulate useEffect but with debounce if deps change quickly
export default function useDebounceEffect(props: DebounceEffect) {
  // destructure props
  const { legacyCallback, callback, dependencies, timeout } = props;

  // set internal deps to be used in useEffect
  const [internalDeps, setInternalDeps] = React.useState(dependencies);

  // change internal deps when deps change (but with debounce)
  const makeInternalDepChange = React.useCallback(
    _.debounce(
      (deps) => {
        setInternalDeps(deps);
      },
      timeout,
      {
        leading: false,
        trailing: true,
      }
    ),
    [timeout]
  );

  // internal dep change
  React.useEffect(() => {
    // legacy callback
    if (legacyCallback) {
      legacyCallback();
    }
    if (dependencies) {
      makeInternalDepChange(dependencies);
    }
  }, dependencies);

  // callback when internal deps change
  React.useEffect(callback, internalDeps);
}
