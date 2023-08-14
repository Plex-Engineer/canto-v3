import { useEffect } from "react";

// will autoselect the first item in an array if no override provided
export default function useAutoSelect(
  items: Array<{ id: string } | string>,
  setter: (itemId: string) => void,
  override?: string
) {
  useEffect(() => {
    if (items && items.length > 0) {
      if (override) {
        return setter(override);
      } else if (typeof items[0] === "string") {
        return setter(items[0]);
      } else {
        return setter(items[0].id);
      }
    }
  }, [items]);
}
