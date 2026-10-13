import Workspace from "src/components/workspace/workspace";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "src/hooks/use-auth";
import { Roles } from "src/components/roles";

// Preserve the existing sign-in destination. The role selector in the sample
// workspace never supplies credentials or changes the authenticated user.
export default function Home() {
  const auth = useAuth();
  const router = useRouter();
  const destinations = {
    [Roles.Admin]: "/dashboard",
    [Roles.Host]: "/ApprovalVistis",
    [Roles.Visitor]: "/standard",
    [Roles.Planner]: "/dashboardplanner",
    [Roles.SecurityGuard]: "/securityRegistration",
  };
  const destination = auth.isAuthenticated
    ? destinations[auth.user?.roles]
    : null;
  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, router]);
  if (destination)
    return (
      <p style={{ padding: 32, color: "#2E624B" }}>Opening your workspace…</p>
    );
  return <Workspace />;
}
