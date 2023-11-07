"use client"
import { usePathname } from 'next/navigation';

function MyServerComponent() {
  const pathname = usePathname();

  // Use `pathname` for server-side logic such as fetching data
  // based on the current path.

  return <div>Current Proposal {pathname}</div>;
}

export default MyServerComponent;
