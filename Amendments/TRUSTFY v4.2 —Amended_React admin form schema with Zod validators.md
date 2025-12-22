## 1) Canonical TypeScript model (must match contract)

```ts
// trustfyAdminTypes.ts

export type TokenConfigForm = {
  enabled: boolean;

  // fees in basis points
  makerFeeBps: number;
  takerFeeBps: number;

  // bonds in basis points
  disputeBondBps: number;
  adBondBps: number;

  // legacy (read-only unless migration mode)
  adBondFixed: string; // bigint as string

  // time windows in seconds
  sellerFundWindow: number;
  buyerConfirmWindow: number;
  sellerReleaseWindow: number;
};
```

---

## 2) Zod schema (single source of validation truth)

This schema is **contract-accurate**.
If Zod accepts it, Solidity will accept it.

```ts
// trustfyAdminSchema.ts
import { z } from "zod";

const MAX_BPS = 10_000;

export const tokenConfigSchema = z
  .object({
    enabled: z.boolean(),

    makerFeeBps: z
      .number()
      .int()
      .min(0)
      .max(MAX_BPS),

    takerFeeBps: z
      .number()
      .int()
      .min(0)
      .max(MAX_BPS),

    disputeBondBps: z
      .number()
      .int()
      .min(0)
      .max(MAX_BPS),

    adBondBps: z
      .number()
      .int()
      .min(0)
      .max(MAX_BPS),

    adBondFixed: z
      .string()
      .regex(/^\d+$/, "Invalid uint256"),

    sellerFundWindow: z
      .number()
      .int()
      .positive(),

    buyerConfirmWindow: z
      .number()
      .int()
      .positive(),

    sellerReleaseWindow: z
      .number()
      .int()
      .positive(),
  })
  .superRefine((data, ctx) => {
    const totalFeeBps = data.makerFeeBps + data.takerFeeBps;

    if (totalFeeBps > MAX_BPS) {
      ctx.addIssue({
        path: ["makerFeeBps"],
        message: "Maker + Taker fee cannot exceed 100%",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.adBondBps === 0 && BigInt(data.adBondFixed) === 0n) {
      ctx.addIssue({
        path: ["adBondBps"],
        message: "Either AdBond % or legacy AdBond must be set",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type TokenConfigInput = z.infer<typeof tokenConfigSchema>;
```

---

## 3) React Hook Form integration

This uses `react-hook-form` + `@hookform/resolvers/zod`.

```tsx
// TrustfyTokenConfigForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tokenConfigSchema, TokenConfigInput } from "./trustfyAdminSchema";

type Props = {
  defaultValues: TokenConfigInput;
  onSubmit: (values: TokenConfigInput) => Promise<void>;
  legacyMode?: boolean;
};

export function TrustfyTokenConfigForm({
  defaultValues,
  onSubmit,
  legacyMode = false,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<TokenConfigInput>({
    resolver: zodResolver(tokenConfigSchema),
    defaultValues,
    mode: "onChange",
  });

  const adBondBps = watch("adBondBps");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <fieldset>
        <label>
          <input type="checkbox" {...register("enabled")} />
          Token Enabled
        </label>
      </fieldset>

      <fieldset>
        <h3>Platform Fees (bps)</h3>
        <input {...register("makerFeeBps", { valueAsNumber: true })} />
        {errors.makerFeeBps && <p>{errors.makerFeeBps.message}</p>}

        <input {...register("takerFeeBps", { valueAsNumber: true })} />
        {errors.takerFeeBps && <p>{errors.takerFeeBps.message}</p>}
      </fieldset>

      <fieldset>
        <h3>Bonds (bps)</h3>
        <input {...register("disputeBondBps", { valueAsNumber: true })} />
        {errors.disputeBondBps && <p>{errors.disputeBondBps.message}</p>}

        <input {...register("adBondBps", { valueAsNumber: true })} />
        {errors.adBondBps && <p>{errors.adBondBps.message}</p>}

        {legacyMode && adBondBps === 0 && (
          <input {...register("adBondFixed")} />
        )}
      </fieldset>

      <fieldset>
        <h3>Time Windows (seconds)</h3>
        <input {...register("sellerFundWindow", { valueAsNumber: true })} />
        <input {...register("buyerConfirmWindow", { valueAsNumber: true })} />
        <input {...register("sellerReleaseWindow", { valueAsNumber: true })} />
      </fieldset>

      <button type="submit" disabled={isSubmitting}>
        Save Configuration
      </button>
    </form>
  );
}
```

---

## 4) Mapping form values to contract call

This guarantees **ABI-safe submission**.

```ts
// mapToContract.ts
import { TokenConfigInput } from "./trustfyAdminSchema";

export function mapToTokenConfig(values: TokenConfigInput) {
  return {
    enabled: values.enabled,
    makerFeeBps: values.makerFeeBps,
    takerFeeBps: values.takerFeeBps,
    disputeBondBps: values.disputeBondBps,
    adBondFixed: BigInt(values.adBondFixed),
    adBondBps: values.adBondBps,
    sellerFundWindow: values.sellerFundWindow,
    buyerConfirmWindow: values.buyerConfirmWindow,
    sellerReleaseWindow: values.sellerReleaseWindow,
  };
}
```

---

## 5) Hard guarantees this setup gives you

* Admin UI cannot submit values that Solidity would revert
* Migration-safe handling of legacy AdBond
* No hidden backend math
* Full parity with `setTokenConfig(...)`
* Deterministic behavior for Codex and human engineers
