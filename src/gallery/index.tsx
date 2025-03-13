import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FolderOpen } from "lucide-react";
import { Link } from "react-router";

export default function Gallery() {
  const { data, error, isLoading } = useQuery<string[], Error>({
    queryKey: ["media"],
    queryFn: async () => {
      const response = await fetch("/api/media");
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto min-w-md">
      <h1 className="text-center py-4 font-bold text-3xl text-primary">
        Folders
      </h1>
      <div className="flex justify-center">
        <ul className="flex flex-col text-xl text-primary w-full max-w-md">
          {data.map((d) => (
            <li key={d} className="group relative">
              <div className="relative w-full items-center justify-between rounded-md before:content-[''] before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-[-1] before:h-full before:w-full before:rounded-md before:transition before:ease-linear before:duration-75 focus-visible:outline-none focus-visible:before:outline-1 focus-visible:before:outline-offset-2 hover:before:bg-primary/4 hover:before:opacity-50 dark:hover:before:opacity-70">
                <Link
                  to={`/${d}`}
                  className="flex gap-2 items-center transition ease-curve-a duration-250 p-3 h-full w-full focus-visible:rounded-sm"
                >
                  <FolderOpen />
                  {d}
                  <ChevronRight className="right-0 md:right-3xs duration-fast pointer-events-none absolute top-1/2 -translate-y-1/2 transition-opacity group-hover:opacity-100 md:translate-x-[0.125rem] md:opacity-0" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
