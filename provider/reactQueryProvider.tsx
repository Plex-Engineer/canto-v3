import { QueryClient, QueryClientProvider } from "react-query";

export const ReactQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: {
          queries: {
            notifyOnChangeProps: ["data", "error"],
            isDataEqual: (oldData, newData) =>
              JSON.stringify(oldData) === JSON.stringify(newData),
            keepPreviousData: true,
          },
        },
      })
    }
  >
    {children}
  </QueryClientProvider>
);
