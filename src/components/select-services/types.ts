export type BillingPeriod = "monthly" | "yearly";

/** Per-row choices the user makes on top of a backend `SelectableService`. */
export interface ServiceSelection {
  selected: boolean;
  quantity: number;
  period: BillingPeriod;
}
