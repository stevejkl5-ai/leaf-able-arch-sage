import { createFileRoute } from "@tanstack/react-router";
import { Footgle } from "@/components/footgle";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Footgle />;
}
