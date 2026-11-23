import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, csrfToken } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { AdminForm } from "@/components/admin-form";
import { TranslationFields, Order, Check } from "@/components/admin-fields";
import { ImageUpload } from "@/components/image-upload";
import {
  saveItem,
  deleteItem,
  saveVariant,
  saveImage,
  removeChild,
} from "../../actions";
export default async function ItemEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const item =
    id === "new"
      ? null
      : await db.menuItem.findFirst({
          where: { id, deletedAt: null },
          include: {
            variants: { orderBy: { displayOrder: "asc" } },
            images: { orderBy: { displayOrder: "asc" } },
          },
        });
  if (id !== "new" && !item) notFound();
  const categories = await db.menuCategory.findMany({
    where: { deletedAt: null },
    orderBy: { displayOrder: "asc" },
  });
  const csrf = await csrfToken();
  const readOnly = user.role === "VIEWER";
  return (
    <>
      <AdminNav />
      <main>
        <h1>{item?.nameMn ?? "New menu item"}</h1>
        {readOnly && <p className="notice">Read-only access.</p>}
        <fieldset disabled={readOnly}>
          <AdminForm csrf={csrf} action={saveItem} label="Save item">
            <input type="hidden" name="id" value={item?.id ?? ""} />
            <input type="hidden" name="currency" value="MNT" />
            <div className="admin-panel">
              <TranslationFields value={item ?? {}} />
              <div className="admin-grid">
                <label>
                  <span>Slug *</span>
                  <input
                    name="slug"
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    defaultValue={item?.slug}
                  />
                </label>
                <label>
                  <span>Category *</span>
                  <select
                    name="categoryId"
                    defaultValue={item?.categoryId}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameMn}
                        {c.isActive ? "" : " (hidden)"}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Price · MNT (blank = pending)</span>
                  <input
                    type="number"
                    name="price"
                    min={0}
                    max={100000000}
                    step={1}
                    defaultValue={item?.price ?? ""}
                  />
                </label>
                <label>
                  <span>Size (verified source text)</span>
                  <input name="size" defaultValue={item?.size ?? ""} />
                </label>
                <Order value={item?.displayOrder} />
              </div>
              <Check
                name="isActive"
                label="Publish item (only visible in an active category)"
                checked={item?.isActive}
              />
              <Check
                name="isFeatured"
                label="Featured"
                checked={item?.isFeatured}
              />
              <p>
                Keep incomplete or unverified content hidden. Blank translations
                display as pending.
              </p>
              <ImageUpload csrf={csrf} initial={item?.imageUrl} />
            </div>
          </AdminForm>
        </fieldset>
        {item && (
          <>
            <section className="admin-panel">
              <h2>Variants</h2>
              <p>
                Add only verified variants. No unverified fruit soju flavors.
              </p>
              {[...item.variants, null].map((v, index) => (
                <fieldset disabled={readOnly} key={v?.id ?? "new"}>
                  <legend>{v ? "Edit variant" : "Add variant"}</legend>
                  <AdminForm
                    csrf={csrf}
                    action={saveVariant}
                    label={v ? "Save variant" : "Add variant"}
                  >
                    <input type="hidden" name="id" value={v?.id ?? ""} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <TranslationFields value={v ?? {}} descriptions={false} />
                    <label>
                      <span>Price · MNT (blank = pending)</span>
                      <input
                        type="number"
                        name="price"
                        min={0}
                        max={100000000}
                        defaultValue={v?.price ?? ""}
                      />
                    </label>
                    <Order value={v?.displayOrder ?? index} />
                    <Check
                      name="isActive"
                      label="Active variant"
                      checked={v?.isActive}
                    />
                  </AdminForm>
                  {v && (
                    <AdminForm
                      csrf={csrf}
                      action={removeChild}
                      label="Remove variant"
                    >
                      <input type="hidden" name="kind" value="variant" />
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <label>
                        <span>Type DELETE to remove this variant</span>
                        <input name="confirm" required pattern="DELETE" />
                      </label>
                    </AdminForm>
                  )}
                </fieldset>
              ))}
            </section>
            <section className="admin-panel">
              <h2>Extra images</h2>
              {[...item.images, null].map((img, index) => (
                <fieldset disabled={readOnly} key={img?.id ?? "new"}>
                  <legend>{img ? "Edit image" : "Add image"}</legend>
                  <AdminForm csrf={csrf} action={saveImage} label="Save image">
                    <input type="hidden" name="id" value={img?.id ?? ""} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <ImageUpload name="url" csrf={csrf} initial={img?.url} />
                    <div className="admin-grid">
                      {(["Mn", "Ko", "En"] as const).map((l) => (
                        <label key={l}>
                          <span>
                            Alt text · {l.toUpperCase()}
                            {l === "Mn" ? " *" : ""}
                          </span>
                          <input
                            name={`alt${l}`}
                            required={l === "Mn"}
                            defaultValue={img?.[`alt${l}`] ?? ""}
                          />
                        </label>
                      ))}
                    </div>
                    <Order value={img?.displayOrder ?? index} />
                  </AdminForm>
                  {img && (
                    <AdminForm
                      csrf={csrf}
                      action={removeChild}
                      label="Remove image"
                    >
                      <input type="hidden" name="kind" value="image" />
                      <input type="hidden" name="id" value={img.id} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <label>
                        <span>Type DELETE to remove this image</span>
                        <input name="confirm" required pattern="DELETE" />
                      </label>
                    </AdminForm>
                  )}
                </fieldset>
              ))}
            </section>
            {!readOnly && (
              <section className="admin-panel">
                <h2>Delete item</h2>
                <p>
                  This hides and soft-deletes the item. Its record and audit
                  history are preserved.
                </p>
                <AdminForm csrf={csrf} action={deleteItem} label="Delete item">
                  <input type="hidden" name="id" value={item.id} />
                  <label>
                    <span>Type DELETE to confirm</span>
                    <input name="confirm" required pattern="DELETE" />
                  </label>
                </AdminForm>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
