import { useEffect } from "react";

/**
 * @description helper hook to autoselect an item from an array
 * @dev will autoselect the first item in an array if no override provided
 * @param {Array<{id: string} | string>} items array of items to select from
 * @param setter function to set the selected item
 * @param override optional override to select a specific item
 */
export default function useAutoSelect(
  items: Array<{ id: string } | string>,
  setter: (itemId: string) => void,
  override?: string
) {
  useEffect(() => {
    if (items && items.length > 0) {
      return override &&
        items.some((item) =>
          typeof item === "string" ? item === override : item.id === override
        )
        ? setter(override)
        : setter(typeof items[0] === "string" ? items[0] : items[0].id);
    }
  }, [items]);
}
