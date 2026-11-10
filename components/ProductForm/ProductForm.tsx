"use client";

import { useState } from "react";
import {
  BadgePercent,
  Boxes,
  FileText,
  Info,
  Palette,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  AVAILABILITY_OPTIONS,
  type ProductAvailability,
} from "@/lib/product-admin";
import { CATEGORY_OPTIONS, type ProductFormValues } from "@/lib/product-form";
import styles from "./ProductForm.module.css";

type ProductFormProps = {
  values: ProductFormValues;
  onChange: (next: ProductFormValues) => void;
  disabled?: boolean;
  compact?: boolean;
};

const AVAILABILITY_LABELS: Record<ProductAvailability, string> = {
  available: "Available",
  limited: "Limited",
  "sold-out": "Sold out",
};

function Section({
  icon,
  title,
  description,
  children,
  compact,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`${styles.section} ${compact ? styles.sectionCompact : ""}`}>
      <header className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{icon}</span>
        <div>
          <h3 className={styles.sectionTitle}>{title}</h3>
          {description && <p className={styles.sectionText}>{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

export default function ProductForm({
  values,
  onChange,
  disabled = false,
  compact = false,
}: ProductFormProps) {
  const [colorDraft, setColorDraft] = useState("");

  const update = (patch: Partial<ProductFormValues>) => {
    onChange({ ...values, ...patch });
  };

  const addColor = () => {
    const color = colorDraft.trim();
    if (!color || values.colors.includes(color)) {
      setColorDraft("");
      return;
    }
    update({ colors: [...values.colors, color] });
    setColorDraft("");
  };

  const removeColor = (color: string) => {
    update({ colors: values.colors.filter((entry) => entry !== color) });
  };

  const addSpec = () => {
    update({ specs: [...values.specs, { key: "", value: "" }] });
  };

  const updateSpec = (index: number, patch: { key?: string; value?: string }) => {
    update({
      specs: values.specs.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    });
  };

  const removeSpec = (index: number) => {
    update({ specs: values.specs.filter((_, rowIndex) => rowIndex !== index) });
  };

  return (
    <div className={`${styles.form} ${compact ? styles.formCompact : ""}`}>
      <Section icon={<Info size={16} />} title="Basics" compact={compact}>
        <div className={styles.grid}>
          <label className={`${styles.field} ${styles.full}`}>
            <span className={styles.label}>
              Product name <span className={styles.required}>*</span>
            </span>
            <input
              className={styles.input}
              value={values.name}
              onChange={(event) => update({ name: event.target.value })}
              placeholder="e.g. Curren Square Watch"
              maxLength={200}
              required
              disabled={disabled}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Brand</span>
            <input
              className={styles.input}
              value={values.brand}
              onChange={(event) => update({ brand: event.target.value })}
              placeholder="e.g. Curren"
              maxLength={120}
              disabled={disabled}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Category</span>
            <select
              className={styles.select}
              value={values.category}
              onChange={(event) => update({ category: event.target.value })}
              disabled={disabled}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              Price <span className={styles.required}>*</span>
            </span>
            <div className={styles.priceRow}>
              <input
                className={styles.input}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => update({ price: event.target.value })}
                placeholder="0"
                required
                disabled={disabled}
              />
              <input
                className={`${styles.input} ${styles.currencyInput}`}
                value={values.currency}
                onChange={(event) => update({ currency: event.target.value })}
                maxLength={12}
                aria-label="Currency"
                disabled={disabled}
              />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Badge</span>
            <div className={styles.inputWrap}>
              <BadgePercent size={15} className={styles.inputIcon} />
              <input
                className={`${styles.input} ${styles.withIcon}`}
                value={values.badge}
                onChange={(event) => update({ badge: event.target.value })}
                placeholder="e.g. New arrival"
                maxLength={120}
                disabled={disabled}
              />
            </div>
          </label>
        </div>
      </Section>

      <Section
        icon={<Boxes size={16} />}
        title="Inventory & visibility"
        compact={compact}
      >
        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Stock</span>
            <input
              className={styles.input}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={values.stock}
              onChange={(event) => update({ stock: event.target.value })}
              placeholder="Leave empty for unlimited"
              disabled={disabled}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Availability</span>
            <select
              className={styles.select}
              value={values.availability}
              onChange={(event) =>
                update({ availability: event.target.value as ProductAvailability })
              }
              disabled={disabled}
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {AVAILABILITY_LABELS[option]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Sort order</span>
            <input
              className={styles.input}
              type="number"
              inputMode="numeric"
              step="1"
              value={values.sortOrder}
              onChange={(event) => update({ sortOrder: event.target.value })}
              disabled={disabled}
            />
          </label>

          <div className={styles.field}>
            <span className={styles.label}>Storefront status</span>
            <label className={styles.switchRow}>
              <button
                type="button"
                role="switch"
                aria-checked={values.active}
                className={`${styles.switch} ${values.active ? styles.switchOn : ""}`}
                onClick={() => update({ active: !values.active })}
                disabled={disabled}
              >
                <span className={styles.switchKnob} />
              </button>
              <span className={styles.switchText}>
                <strong>{values.active ? "Visible" : "Hidden"}</strong>
                <small>
                  {values.active
                    ? "Customers can see this product"
                    : "Only visible in the dashboard"}
                </small>
              </span>
            </label>
          </div>
        </div>
      </Section>

      <Section
        icon={<FileText size={16} />}
        title="Descriptions"
        compact={compact}
      >
        <div className={styles.grid}>
          <label className={`${styles.field} ${styles.full}`}>
            <span className={styles.label}>Description</span>
            <textarea
              className={styles.textarea}
              value={values.description}
              onChange={(event) => update({ description: event.target.value })}
              placeholder="The product story shown on cards and the product page"
              rows={compact ? 3 : 5}
              maxLength={20000}
              disabled={disabled}
            />
            <span className={styles.counter}>{values.description.length}/20000</span>
          </label>
        </div>
      </Section>

      <Section
        icon={<Palette size={16} />}
        title="Colors"
        description="Options customers can pick when ordering"
        compact={compact}
      >
        <div className={styles.tagEditor}>
          {values.colors.length > 0 && (
            <div className={styles.tags}>
              {values.colors.map((color) => (
                <span key={color} className={styles.tag}>
                  {color}
                  <button
                    type="button"
                    className={styles.tagRemove}
                    onClick={() => removeColor(color)}
                    aria-label={`Remove ${color}`}
                    disabled={disabled}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className={styles.addRow}>
            <input
              className={styles.input}
              value={colorDraft}
              onChange={(event) => setColorDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addColor();
                }
              }}
              placeholder="e.g. Black, Silver, Gold"
              maxLength={60}
              disabled={disabled}
            />
            <button
              type="button"
              className={styles.addButton}
              onClick={addColor}
              disabled={disabled || !colorDraft.trim()}
            >
              <Plus size={15} />
              Add
            </button>
          </div>
        </div>
      </Section>

      <Section
        icon={<SlidersHorizontal size={16} />}
        title="Specifications"
        description="Key-value details such as movement, case size or water resistance"
        compact={compact}
      >
        <div className={styles.specList}>
          {values.specs.length === 0 && (
            <p className={styles.emptySpecs}>No specifications yet.</p>
          )}
          {values.specs.map((row, index) => (
            <div key={index} className={styles.specRow}>
              <input
                className={styles.input}
                value={row.key}
                onChange={(event) => updateSpec(index, { key: event.target.value })}
                placeholder="Label, e.g. Movement"
                maxLength={80}
                disabled={disabled}
              />
              <input
                className={styles.input}
                value={row.value}
                onChange={(event) => updateSpec(index, { value: event.target.value })}
                placeholder="Value, e.g. Quartz"
                maxLength={300}
                disabled={disabled}
              />
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => removeSpec(index)}
                aria-label="Remove specification"
                disabled={disabled}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={addSpec}
          disabled={disabled}
        >
          <Plus size={15} />
          Add specification
        </button>
      </Section>
    </div>
  );
}
