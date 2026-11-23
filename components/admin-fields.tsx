type TextRecord = {
  nameMn?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
  descriptionMn?: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
};
export function TranslationFields({
  value = {},
  descriptions = true,
}: {
  value?: TextRecord;
  descriptions?: boolean;
}) {
  return (
    <div className="admin-grid">
      {(["Mn", "Ko", "En"] as const).map((lang) => (
        <div key={lang}>
          <label>
            <span>
              Name · {lang.toUpperCase()}
              {lang === "Mn" ? " *" : " (pending if blank)"}
            </span>
            <input
              name={`name${lang}`}
              defaultValue={value[`name${lang}`] ?? ""}
              required={lang === "Mn"}
              maxLength={200}
            />
          </label>
          {descriptions && (
            <label>
              <span>Description · {lang.toUpperCase()}</span>
              <textarea
                name={`description${lang}`}
                defaultValue={value[`description${lang}`] ?? ""}
                maxLength={4000}
              />
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
export function Check({
  name,
  label,
  checked = false,
}: {
  name: string;
  label: string;
  checked?: boolean;
}) {
  return (
    <label>
      <input type="checkbox" name={name} defaultChecked={checked} /> {label}
    </label>
  );
}
export function Order({ value = 0 }: { value?: number }) {
  return (
    <label>
      <span>Display order</span>
      <input
        type="number"
        name="displayOrder"
        min={0}
        max={100000}
        defaultValue={value}
      />
    </label>
  );
}
