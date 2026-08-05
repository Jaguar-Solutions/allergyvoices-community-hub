import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Download, LogOut, Search } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Container, PageLayout, Section } from "@/components/layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminGate } from "@/components/admin/AdminGate";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  downloadCsv,
  fetchAllRestaurants,
  fetchLatestAnswers,
  signOutAdmin,
  toCsv,
  type AdminListing,
} from "@/program/admin-api";
import { CONSENT_LABELS, STATUS_LABELS, type RestaurantStatus } from "@/program/types";
import { US_STATES } from "@/program/us-states";

const ANY = "__any__";

const STATUS_ORDER: RestaurantStatus[] = [
  "submitted",
  "in_review",
  "changes_requested",
  "published",
  "hidden",
  "declined",
];

function SubmissionsInner() {
  const [status, setStatus] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: fetchAllRestaurants,
  });

  const listings = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cityFilter = city.trim().toLowerCase();
    return listings.filter((listing) => {
      if (status && listing.status !== status) return false;
      if (state && listing.state !== state) return false;
      if (cityFilter && !listing.city.toLowerCase().includes(cityFilter)) return false;
      if (q) {
        const haystack = [
          listing.name,
          listing.city,
          listing.contact?.manager_email ?? "",
          listing.contact?.manager_name ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [listings, status, state, city, query]);

  const counts = useMemo(() => {
    const byStatus = new Map<RestaurantStatus, number>();
    for (const listing of listings) {
      byStatus.set(listing.status, (byStatus.get(listing.status) ?? 0) + 1);
    }
    return byStatus;
  }, [listings]);

  const handleExport = async () => {
    setExporting(true);
    try {
      // The answers live in `restaurant_submissions`, not on the listing row,
      // so unreviewed submissions still export with their full responses.
      const answers = await fetchLatestAnswers();
      const stamp = new Date().toISOString().slice(0, 10);
      downloadCsv(`allergyvoices-restaurants-${stamp}.csv`, toCsv(filtered, answers));
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageLayout>
      <SEOHead title="Restaurant submissions" description="Admin dashboard" />

      <Section className="pt-28 md:pt-32" spacing="sm">
        <Container width="wide">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
                Restaurant submissions
              </h1>
              <p className="mt-1 font-inter text-muted-foreground">
                {listings.length} total ·{" "}
                {STATUS_ORDER.filter((s) => counts.get(s))
                  .map((s) => `${counts.get(s)} ${STATUS_LABELS[s].toLowerCase()}`)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={exporting || filtered.length === 0}
              >
                <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {exporting ? "Preparing…" : "Export CSV"}
              </Button>
              <Button variant="ghost" onClick={() => signOutAdmin()}>
                <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-background-subtle p-5 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="admin-search" className="font-inter text-sm font-medium">
                Search
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="admin-search"
                  type="search"
                  className="pl-9"
                  placeholder="Name, contact, email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-status" className="font-inter text-sm font-medium">
                Status
              </Label>
              <Select
                value={status || ANY}
                onValueChange={(v) => setStatus(v === ANY ? "" : v)}
              >
                <SelectTrigger id="admin-status">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any status</SelectItem>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-state" className="font-inter text-sm font-medium">
                State
              </Label>
              <Select
                value={state || ANY}
                onValueChange={(v) => setState(v === ANY ? "" : v)}
              >
                <SelectTrigger id="admin-state">
                  <SelectValue placeholder="Any state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any state</SelectItem>
                  {US_STATES.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-city" className="font-inter text-sm font-medium">
                City
              </Label>
              <Input
                id="admin-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Any city"
              />
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          )}

          {isError && (
            <p className="py-16 text-center font-inter text-muted-foreground">
              Could not load submissions. Check that your account has the admin role.
            </p>
          )}

          {!isLoading && !isError && (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((listing) => (
                    <SubmissionRow key={listing.id} listing={listing} />
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No submissions match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Container>
      </Section>
    </PageLayout>
  );
}

function SubmissionRow({ listing }: { listing: AdminListing }) {
  return (
    <TableRow>
      <TableCell>
        <Link
          to={`/admin/restaurants/${listing.id}`}
          className="font-poppins font-semibold text-foreground hover:text-primary"
        >
          {listing.name}
        </Link>
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {listing.city}, {listing.state}
      </TableCell>
      <TableCell>
        <StatusBadge status={listing.status} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {CONSENT_LABELS[listing.publish_consent]}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {listing.contact?.manager_email ?? "—"}
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {new Date(listing.submitted_at).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
}

const Submissions = () => (
  <AdminGate>
    <SubmissionsInner />
  </AdminGate>
);

export default Submissions;
