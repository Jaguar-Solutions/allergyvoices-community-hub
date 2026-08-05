import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Loader2, LogOut, ShieldAlert } from "lucide-react";
import { Container, PageLayout, Section } from "@/components/layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSession } from "@/hooks/use-admin-session";
import { signInAdmin, signOutAdmin } from "@/program/admin-api";

/**
 * Wraps the admin surfaces. Renders a sign-in form when nobody is signed in,
 * and a plain "no access" message for a signed-in user without the admin
 * role — RLS already denies them the data, so there is nothing to protect
 * here beyond a clear explanation.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { loading, session, isAdmin } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  if (!session) {
    const handleSignIn = async (event: React.FormEvent) => {
      event.preventDefault();
      setSubmitting(true);
      setError(null);
      try {
        await signInAdmin(email, password);
      } catch (signInError) {
        setError(
          signInError instanceof Error
            ? signInError.message
            : "Could not sign in. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <PageLayout>
        <Section className="pt-28 md:pt-32">
          <Container width="narrow">
            <div className="mx-auto max-w-md">
              <h1 className="font-poppins text-2xl font-bold text-foreground">
                Admin sign in
              </h1>
              <p className="mt-2 font-inter text-sm text-muted-foreground">
                Restaurant program dashboard.
              </p>

              <Card className="mt-6">
                <CardContent className="p-6">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="font-inter font-medium">
                        Email
                      </Label>
                      <Input
                        id="admin-email"
                        type="email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password" className="font-inter font-medium">
                        Password
                      </Label>
                      <Input
                        id="admin-password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    {error && (
                      <p role="alert" className="font-inter text-sm font-medium text-destructive">
                        {error}
                      </p>
                    )}

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      )}
                      Sign in
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <Section className="pt-28 md:pt-32">
          <Container width="narrow">
            <div className="mx-auto max-w-md text-center">
              <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <h1 className="mt-4 font-poppins text-2xl font-bold text-foreground">
                This account doesn't have admin access
              </h1>
              <p className="mt-2 font-inter text-muted-foreground">
                Signed in as {session.user.email}.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button variant="outline" onClick={() => signOutAdmin()}>
                  <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Sign out
                </Button>
                <Button asChild>
                  <Link to="/">Back to the site</Link>
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return <>{children}</>;
}
