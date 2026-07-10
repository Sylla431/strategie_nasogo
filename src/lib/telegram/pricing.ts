/** Tarifs VIP Telegram Signaux (FCFA) */
export const VIP_ADHESION_AMOUNT = 30000;
export const VIP_RENEWAL_AMOUNT = 10000;
export const VIP_MONTHS_PER_PAYMENT = 1;

export type VipPaymentKind = "adhesion" | "renewal";

export function resolveVipCheckout(hasExistingSubscription: boolean): {
  kind: VipPaymentKind;
  amount: number;
  months: number;
  label: string;
} {
  if (hasExistingSubscription) {
    return {
      kind: "renewal",
      amount: VIP_RENEWAL_AMOUNT,
      months: VIP_MONTHS_PER_PAYMENT,
      label: "Renouvellement VIP Telegram — 1 mois",
    };
  }
  return {
    kind: "adhesion",
    amount: VIP_ADHESION_AMOUNT,
    months: VIP_MONTHS_PER_PAYMENT,
    label: "Adhésion VIP Telegram (1er mois inclus)",
  };
}
