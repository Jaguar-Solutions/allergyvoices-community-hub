import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { Question } from "@/program/survey";
import type { AnswerValue } from "@/program/types";

interface QuestionFieldProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  error?: string;
}

/**
 * Renders one survey question from its definition.
 *
 * Accessibility notes: choice questions are a fieldset with a legend so
 * screen readers announce the question before the options; errors are
 * associated with `aria-describedby` and announced politely rather than
 * relying on red text alone.
 */
export function QuestionField({
  question,
  value,
  onChange,
  error,
}: QuestionFieldProps) {
  const legendId = `${question.id}-legend`;
  const helpId = question.help ? `${question.id}-help` : undefined;
  const errorId = error ? `${question.id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  const help = question.help && (
    <p id={helpId} className="font-inter text-sm text-muted-foreground">
      {question.help}
    </p>
  );

  const errorMessage = error && (
    <p
      id={errorId}
      role="alert"
      className="font-inter text-sm font-medium text-destructive"
    >
      {error}
    </p>
  );

  if (question.type === "single" || question.type === "yesno") {
    const selected = typeof value === "string" ? value : "";
    return (
      <fieldset className="space-y-3">
        <legend id={legendId} className="font-inter font-medium text-foreground">
          {question.label}
          {question.required && (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          )}
          {question.required && <span className="sr-only"> (required)</span>}
        </legend>
        {help}
        <RadioGroup
          value={selected}
          onValueChange={onChange}
          aria-labelledby={legendId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="gap-2.5"
        >
          {question.options?.map((option) => {
            const id = `${question.id}-${option.value}`;
            return (
              <div key={option.value} className="flex items-center gap-3">
                <RadioGroupItem value={option.value} id={id} />
                <Label htmlFor={id} className="font-inter font-normal">
                  {option.label}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        {errorMessage}
      </fieldset>
    );
  }

  if (question.type === "multi") {
    const selected = Array.isArray(value) ? value : [];

    const toggle = (optionValue: string, checked: boolean) => {
      // "None of the above" is mutually exclusive with everything else —
      // both directions, so the answer can never contradict itself.
      if (optionValue === "none") {
        onChange(checked ? ["none"] : []);
        return;
      }
      const withoutNone = selected.filter((v) => v !== "none");
      onChange(
        checked
          ? [...withoutNone, optionValue]
          : withoutNone.filter((v) => v !== optionValue),
      );
    };

    return (
      <fieldset className="space-y-3">
        <legend id={legendId} className="font-inter font-medium text-foreground">
          {question.label}
        </legend>
        {help}
        <div
          className="grid gap-2.5 sm:grid-cols-2"
          aria-describedby={describedBy}
        >
          {question.options?.map((option) => {
            const id = `${question.id}-${option.value}`;
            return (
              <div key={option.value} className="flex items-center gap-3">
                <Checkbox
                  id={id}
                  checked={selected.includes(option.value)}
                  onCheckedChange={(checked) => toggle(option.value, checked === true)}
                />
                <Label htmlFor={id} className="font-inter font-normal">
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
        {errorMessage}
      </fieldset>
    );
  }

  const textValue = typeof value === "string" ? value : "";

  return (
    <div className="space-y-2">
      <Label htmlFor={question.id} className="font-inter font-medium text-foreground">
        {question.label}
        {question.required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {question.required && <span className="sr-only"> (required)</span>}
      </Label>
      {help}
      {question.type === "textarea" ? (
        <Textarea
          id={question.id}
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          maxLength={question.maxLength}
          rows={question.id === "family_notes" ? 6 : 4}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
      ) : (
        <Input
          id={question.id}
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          maxLength={question.maxLength}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
      )}
      {errorMessage}
    </div>
  );
}
