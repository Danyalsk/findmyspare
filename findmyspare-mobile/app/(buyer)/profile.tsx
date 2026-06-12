import { useAuthStore } from "@/lib/store";
import { ProfileView } from "@/components/features/ProfileView";
import { AuthGate } from "@/components/features/AuthGate";

export default function BuyerProfileScreen() {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return (
      <AuthGate
        icon="person-circle-outline"
        title="Sign in to FindMySpare"
        subtitle="Save requests, message suppliers, and manage your account. Sellers can list parts too."
      />
    );
  }
  return <ProfileView />;
}
