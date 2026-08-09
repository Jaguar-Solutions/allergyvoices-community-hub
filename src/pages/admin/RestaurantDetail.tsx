import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Save,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Container, PageLayout, Section } from "@/components/layout";
import { ImprovementReport } from "@/components/admin/ImprovementReport";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AdminGate } from "@/components/admin/AdminGate";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  RestaurantDetailsForm,
  type EditableDetails,
} from "@/components/admin/RestaurantDetailsForm";
import { QuestionField } from "@/components/restaurants/QuestionField";
import {
  fetchRestaurantDetail,
  publishRestaurant,
  requestChanges,
  notifyRestaurant,
  saveAdminEdit,
  setStatus,
  updateRestaurantFields,
} from "@/program/admin-api";
import { SURVEY_SECTIONS } from "@/program/survey";
import { CONSENT_LABELS, type Answers, type AnswerValue } from "@/program/types";

function RestaurantDetailInner() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-restaurant", id],
    queryFn: () => fetchRestaurantDetail(id),
    enabled: id.length > 0,
  });

  const latest = data?.submissions[0];
  const [answers, setAnswers] = useState<Answers>({});
  const [dirty, setDirty] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const loadedVersionId = useRef<string | null>(null);

  // Load a submission into the editor when a genuinely different version
  // arrives.
  //
  // Keyed on the submission id, not the object: React Query hands back a new
  // object on every refetch (including the automatic one when the window
  // regains focus), and depending on the object identity meant an admin who
  // switched tabs mid-edit came back to their work silently reverted.
  useEffect(() => {
    if (!latest) return;
    if (loadedVersionId.current === latest.id) return;
    loadedVersionId.current = latest.id;
    setAnswers(latest.answers);
    setDirty(false);
  }, [latest]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-restaurant", id] });
    queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
    queryClient.invalidateQueries({ queryKey: ["published-restaurants"] });
  };

  const notifyError = (error: unknown) =>
    toast({
      title: "That didn't work",
      description: error instanceof Error ? error.message : "Please try again.",
      variant: "destructive",
    });

  const statusMutation = useMutation({
    mutationFn: ({ status, note }: { status: Parameters<typeof setStatus>[1]; note?: string }) =>
      setStatus(id, status, note),
    onSuccess: refresh,
    onError: notifyError,
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!data || !latest) throw new Error("Nothing to publish yet.");
      await publishRestaurant(data.restaurant, latest);
    },
    onSuccess: () => {
      toast({ title: "Published", description: "The listing is live in the directory." });
      refresh();
    },
    onError: notifyError,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!latest) throw new Error("No submission to edit.");
      await saveAdminEdit(id, answers, latest.version);
    },
    onSuccess: () => {
      toast({
        title: "Saved as a new version",
        description: "The original submission is kept in the history.",
      });
      setDirty(false);
      refresh();
    },
    onError: notifyError,
  });

  const detailsMutation = useMutation({
    mutationFn: async (details: EditableDetails) => {
      await updateRestaurantFields(id, {
        ...details,
        address_line2: details.address_line2 || null,
        postal_code: details.postal_code || null,
        phone: details.phone || null,
        website: details.website || null,
      });
    },
    onSuccess: () => {
      toast({ title: "Listing details saved" });
      refresh();
    },
    onError: notifyError,
  });

  const changesMutation = useMutation({
    mutationFn: () => requestChanges(id, changeNote),
    onSuccess: (result) => {
      // The status always changes; the email may not. Say which happened,
      // rather than implying the restaurant was told when it wasn't.
      if (result.ok) {
        toast({
          title: "Changes requested",
          description: `Emailed ${result.sentTo}. They can reply directly.`,
        });
      } else {
        toast({
          title: "Status saved, but the email did not send",
          description: `${result.error} Contact them directly.`,
          variant: "destructive",
        });
      }
      setChangeNote("");
      refresh();
    },
    onError: notifyError,
  });

  const publishNotifyMutation = useMutation({
    mutationFn: () => notifyRestaurant(id, "published"),
    onSuccess: (result) =>
      result.ok
        ? toast({ title: "Restaurant notified", description: `Emailed ${result.sentTo}.` })
        : toast({
            title: "Could not send the email",
            description: result.error,
            variant: "destructive",
          }),
    onError: notifyError,
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  if (isError || !data) {
    return (
      <PageLayout>
        <Section className="pt-28 md:pt-32">
          <Container width="narrow">
            <p className="font-inter text-muted-foreground">
              Could not load this submission.
            </p>
            <Button asChild className="mt-4">
              <Link to="/admin">Back to submissions</Link>
            </Button>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  const { restaurant, contacts, submissions, events } = data;
  const contact = contacts.find((c) => c.is_primary) ?? contacts[0];
  const consentBlocksPublishing = restaurant.publish_consent === "no";
  const needsContactFirst = restaurant.publish_consent === "yes_contact_first";
  const busy =
    statusMutation.isPending ||
    publishMutation.isPending ||
    saveMutation.isPending ||
    changesMutation.isPending;

  const updateAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((a) => ({ ...a, [questionId]: value }));
    setDirty(true);
  };

  return (
    <PageLayout>
      <SEOHead title={`${restaurant.name} — admin`} description="Admin dashboard" />

      <Section className="pt-28 md:pt-32" spacing="sm">
        <Container width="wide">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link to="/admin">
              <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
              All submissions
            </Link>
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
                  {restaurant.name}
                </h1>
                <StatusBadge status={restaurant.status} />
              </div>
              <p className="mt-1 font-inter text-muted-foreground">
                {[restaurant.address_line1, restaurant.city, restaurant.state, restaurant.postal_code]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            {restaurant.status === "published" && restaurant.slug && (
              <Button asChild variant="outline">
                <Link to={`/restaurants/${restaurant.slug}`}>
                  View public profile
                  <ExternalLink className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
            {/* min-w-0 so a long pasted answer can't stretch the column past
                the viewport — grid items default to min-width:auto. */}
            <div className="min-w-0 space-y-8">
              {consentBlocksPublishing && (
                <div className="flex gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-5">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                  <div>
                    <p className="font-poppins font-semibold text-foreground">
                      This restaurant did not consent to publication
                    </p>
                    <p className="mt-1 font-inter text-sm text-muted-foreground">
                      They filled out the survey but asked us not to list them.
                      Publishing is disabled, and the database rejects it too.
                    </p>
                  </div>
                </div>
              )}

              {needsContactFirst && restaurant.status !== "published" && (
                <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-5">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" aria-hidden="true" />
                  <div>
                    <p className="font-poppins font-semibold text-foreground">
                      Contact before publishing
                    </p>
                    <p className="mt-1 font-inter text-sm text-muted-foreground">
                      They asked to be contacted first. Reach out to{" "}
                      {contact?.manager_email ?? "the contact on file"} before you publish.
                    </p>
                  </div>
                </div>
              )}

              <RestaurantDetailsForm
                restaurant={restaurant}
                saving={detailsMutation.isPending}
                onSave={(details) => detailsMutation.mutateAsync(details)}
              />

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-poppins text-xl font-bold text-foreground">
                    Responses
                  </h2>
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={!dirty || busy}
                    variant="outline"
                  >
                    <Save className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    {saveMutation.isPending ? "Saving…" : "Save as new version"}
                  </Button>
                </div>
                <p className="mt-1 font-inter text-sm text-muted-foreground">
                  Edits create a new version. The restaurant's original answers
                  are never overwritten.
                </p>

                <div className="mt-6 space-y-10">
                  {SURVEY_SECTIONS.map((section) => (
                    <fieldset key={section.id} className="space-y-6">
                      <legend className="font-poppins font-semibold text-foreground">
                        {section.title}
                      </legend>
                      {section.questions.map((question) => (
                        <QuestionField
                          key={question.id}
                          question={question}
                          value={answers[question.id]}
                          onChange={(value) => updateAnswer(question.id, value)}
                        />
                      ))}
                    </fieldset>
                  ))}
                </div>
              </div>
            </div>

            <aside className="min-w-0 space-y-5">
              <ImprovementReport
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
                contact={contact}
                hasSubmission={Boolean(latest)}
                submissionSchemaVersion={latest?.schema_version}
              />

              <Card>
                <CardContent className="space-y-3 p-5">
                  <h2 className="font-poppins font-semibold text-foreground">Actions</h2>

                  <Button
                    className="w-full"
                    onClick={() => publishMutation.mutate()}
                    disabled={busy || consentBlocksPublishing || !latest}
                  >
                    <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    {restaurant.status === "published"
                      ? "Republish latest version"
                      : "Publish to directory"}
                  </Button>

                  {restaurant.status === "published" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={busy || publishNotifyMutation.isPending}
                      onClick={() => publishNotifyMutation.mutate()}
                    >
                      <Mail className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      {publishNotifyMutation.isPending
                        ? "Sending…"
                        : "Tell them they're live"}
                    </Button>
                  )}

                  {restaurant.status !== "in_review" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={busy}
                      onClick={() => statusMutation.mutate({ status: "in_review" })}
                    >
                      Mark as in review
                    </Button>
                  )}

                  {restaurant.status === "published" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={busy}
                      onClick={() => statusMutation.mutate({ status: "hidden" })}
                    >
                      <EyeOff className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Hide listing
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive"
                    disabled={busy}
                    onClick={() => statusMutation.mutate({ status: "declined" })}
                  >
                    Do not publish
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3 p-5">
                  <h2 className="flex items-center gap-2 font-poppins font-semibold text-foreground">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    Request changes
                  </h2>
                  <Label htmlFor="change-note" className="font-inter text-sm">
                    What do you need from them?
                  </Label>
                  <p className="font-inter text-xs text-muted-foreground">
                    This is emailed to {contact?.manager_email ?? "the contact on file"},
                    who can reply directly.
                  </p>
                  <Textarea
                    id="change-note"
                    rows={3}
                    value={changeNote}
                    onChange={(e) => setChangeNote(e.target.value)}
                    placeholder="e.g. Confirm whether the fryer is dedicated"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={busy || !changeNote.trim()}
                    onClick={() => changesMutation.mutate()}
                  >
                    Send request
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-2 p-5">
                  <h2 className="font-poppins font-semibold text-foreground">Contact</h2>
                  <p className="font-inter text-sm text-muted-foreground">
                    {contact?.manager_name ?? "—"}
                    {contact?.position ? ` · ${contact.position}` : ""}
                  </p>
                  {contact && (
                    <a
                      href={`mailto:${contact.manager_email}`}
                      className="block font-inter text-sm text-primary hover:underline"
                    >
                      {contact.manager_email}
                    </a>
                  )}
                  {restaurant.phone && (
                    <p className="font-inter text-sm text-muted-foreground">
                      {restaurant.phone}
                    </p>
                  )}
                  <p className="pt-2 font-inter text-sm text-muted-foreground">
                    Consent: {CONSENT_LABELS[restaurant.publish_consent]}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h2 className="font-poppins font-semibold text-foreground">
                    Version history
                  </h2>
                  <ul className="mt-2 space-y-2">
                    {submissions.map((submission) => (
                      <li key={submission.id} className="font-inter text-sm text-muted-foreground">
                        v{submission.version} · {submission.source.replace("_", " ")} ·{" "}
                        {new Date(submission.submitted_at).toLocaleDateString()}
                        {restaurant.published_submission_id === submission.id && (
                          <span className="ml-1 font-medium text-secondary">(live)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h2 className="font-poppins font-semibold text-foreground">Activity</h2>
                  <ul className="mt-2 space-y-2">
                    {events.slice(0, 12).map((event) => (
                      <li key={event.id} className="font-inter text-sm text-muted-foreground">
                        {event.event_type}
                        {event.note ? ` — ${event.note}` : ""} ·{" "}
                        {new Date(event.created_at).toLocaleDateString()}
                      </li>
                    ))}
                    {events.length === 0 && (
                      <li className="font-inter text-sm text-muted-foreground">
                        Nothing recorded yet.
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
}

const RestaurantDetail = () => (
  <AdminGate>
    <RestaurantDetailInner />
  </AdminGate>
);

export default RestaurantDetail;
