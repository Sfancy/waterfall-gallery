import { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Folder() {
  const [height, setHeight] = useState(48);
  let { folder } = useParams();
  const { data, error, isLoading, refetch } = useQuery<string[], Error>({
    queryKey: [folder],
    queryFn: async () => {
      const response = await fetch(`/api/media/${folder}`);
      return response.json();
    },
  });

  const handleRestore = async (name: string) => {
    try {
      const response = await fetch("/api/media/restore", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      if (response.status === 200) {
        refetch();
      }
    } catch (error) {
      toast.error(`Failed to restore ${name}`);
    }
  };

  const handleDelete = async (name: string) => {
    try {
      const response = await fetch("/api/media", {
        method: "DELETE",
        body: JSON.stringify({ name }),
      });
      if (response.status === 204) {
        refetch();
        toast(`${name} has been deleted`, {
          duration: 3000,
          action: {
            label: "Undo",
            onClick: () => handleRestore(name),
          },
        });
      }
    } catch (error) {
      toast.error(`Failed to delete ${name}`);
    }
  };

  return (
    <div className="container mx-auto">
      <input
        type="range"
        name=""
        id=""
        min={1}
        max={100}
        value={height}
        onChange={(e) => setHeight(Number(e.target.value))}
      />
      <div className="max-w-md flex flex-col flex-wrap sm:flex-row">
        {data?.map((d) => (
          <div
            key={d}
            className="relative group"
            style={{ height: `${height * 10}px` }}
          >
            <div className="h-full ease-curve-c relative mx-auto overflow-hidden transition-opacity rounded-md [&_img]:scale-100 [&_img]:transform-gpu [&_video]:transform-gpu [&_img]:transition-transform [&_img]:duration-300 [&_video]:transition-transform [&_video]:duration-200 group-hover:[&_img]:scale-[1.025] group-hover:[&_video]:scale-[1.025]">
              <img src={`/media/${folder}/${d}`} className="h-full w-auto" />
              <Button
                onClick={() => handleDelete(`${folder}/${d}`)}
                variant="ghost"
                type="button"
                className="absolute inset-3 cursor-pointer text-white bg-primary focus:outline-primary backdrop-blur-[4.375rem] ease-curve-a flex items-center justify-center disabled:text-gray-400 outline-offset-2 focus-visible:outline-offset-0 rounded-full w-[32px] h-[32px] hover:bg-primary z-[1] opacity-0 transition duration-200 hover:opacity-100 group-hover:opacity-100 hover:text-white hover:scale-105"
                aria-label="Delete image"
              >
                <Trash2 />
              </Button>
              {/* <div className="relative w-full">
            </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
