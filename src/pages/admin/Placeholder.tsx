import { useLocation } from "react-router-dom";

export default function Placeholder() {
  const location = useLocation();
  const name = location.pathname.split("/").pop()?.replace(/-/g, " ") || "Page";

  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="text-center space-y-3">
        <h2 className="text-xl font-semibold font-sans-body text-foreground capitalize">{name}</h2>
        <p className="text-sm text-muted-foreground font-sans-body">This page is coming soon.</p>
      </div>
    </div>
  );
}
