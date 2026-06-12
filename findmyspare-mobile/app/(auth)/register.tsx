import { Redirect } from "expo-router";

// Sign-up and sign-in are unified under the passwordless email-OTP flow on the
// login screen, so this legacy route just forwards there.
export default function RegisterScreen() {
  return <Redirect href="/(auth)/login" />;
}
