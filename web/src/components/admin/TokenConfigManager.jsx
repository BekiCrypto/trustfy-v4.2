import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, Shield, Settings, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { ethers } from "ethers"
import { ESCROW_ABI, CONTRACT_ADDRESSES, RPC_URLS, EXPLORERS } from "../web3/contractABI"
import { useWallet } from "../web3/WalletContext"
import RoleGuard from "../web3/RoleGuard"
import { tokenConfigSchema } from "./trustfyAdminSchema"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const defaultValues = {
  enabled: true,
  makerFeeBps: 0,
  takerFeeBps: 0,
  disputeBondBps: 0,
  adBondBps: 0,
  adBondFixed: "0",
  sellerFundWindow: 3600,
  buyerConfirmWindow: 3600,
  sellerReleaseWindow: 3600,
}

export default function TokenConfigManager() {
  const { account, signer } = useWallet()
  const [chain, setChain] = useState("BSC_TESTNET")
  const [token, setToken] = useState("BNB")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [legacyMode, setLegacyMode] = useState(false)
  const [previewAmount, setPreviewAmount] = useState(100)

  const tokens = useMemo(() => {
    const addresses = CONTRACT_ADDRESSES[chain] || {}
    return Object.keys(addresses).filter((key) => key !== "escrow")
  }, [chain])

  useEffect(() => {
    if (!tokens.includes(token)) {
      setToken(tokens[0] || "BNB")
    }
  }, [tokens, token])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tokenConfigSchema),
    defaultValues,
    mode: "onChange",
  })

  const formValues = watch()

  const tokenAddressFor = (symbol) => {
    if (symbol === "BNB" || symbol === "MATIC" || symbol === "ETH") return ZERO_ADDRESS
    return CONTRACT_ADDRESSES[chain]?.[symbol] || ZERO_ADDRESS
  }

  const loadConfig = async () => {
    const rpcUrl = RPC_URLS[chain]
    const escrowAddress = CONTRACT_ADDRESSES[chain]?.escrow
    if (!rpcUrl || !escrowAddress) return

    setLoading(true)
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const contract = new ethers.Contract(escrowAddress, ESCROW_ABI, provider)
      const tokenAddress = tokenAddressFor(token)
      const cfg = await contract.tokenConfig(tokenAddress)
      reset({
        enabled: cfg.enabled,
        makerFeeBps: Number(cfg.makerFeeBps),
        takerFeeBps: Number(cfg.takerFeeBps),
        disputeBondBps: Number(cfg.disputeBondBps),
        adBondBps: Number(cfg.adBondBps),
        adBondFixed: cfg.adBondFixed?.toString?.() ?? "0",
        sellerFundWindow: Number(cfg.sellerFundWindow),
        buyerConfirmWindow: Number(cfg.buyerConfirmWindow),
        sellerReleaseWindow: Number(cfg.sellerReleaseWindow),
      })
    } catch (error) {
      toast.error("Failed to load token config from chain.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [chain, token])

  const onSubmit = async (values) => {
    if (!signer) {
      toast.error("Wallet not connected")
      return
    }
    setSaving(true)
    try {
      const escrowAddress = CONTRACT_ADDRESSES[chain]?.escrow
      if (!escrowAddress) {
        toast.error("Escrow contract not configured")
        setSaving(false)
        return
      }
      const contract = new ethers.Contract(escrowAddress, ESCROW_ABI, signer)
      const tokenAddress = tokenAddressFor(token)
      const tx = await contract.setTokenConfig(tokenAddress, {
        enabled: values.enabled,
        makerFeeBps: values.makerFeeBps,
        takerFeeBps: values.takerFeeBps,
        disputeBondBps: values.disputeBondBps,
        adBondFixed: BigInt(values.adBondFixed),
        adBondBps: values.adBondBps,
        sellerFundWindow: values.sellerFundWindow,
        buyerConfirmWindow: values.buyerConfirmWindow,
        sellerReleaseWindow: values.sellerReleaseWindow,
      })
      toast.info("Transaction submitted. Waiting for confirmation…")
      const receipt = await tx.wait()
      toast.success("Token config updated on-chain.", {
        action: {
          label: "View TX",
          onClick: () => window.open(`${EXPLORERS[chain]}/tx/${receipt.hash}`, "_blank"),
        },
      })
      loadConfig()
    } catch (error) {
      toast.error(error?.message || "Failed to update token config")
    } finally {
      setSaving(false)
    }
  }

  const makerFee = (previewAmount * (formValues.makerFeeBps || 0)) / 10_000
  const takerFee = (previewAmount * (formValues.takerFeeBps || 0)) / 10_000
  const disputeBond = (previewAmount * (formValues.disputeBondBps || 0)) / 10_000
  const adBond =
    (formValues.adBondBps || 0) > 0
      ? (previewAmount * (formValues.adBondBps || 0)) / 10_000
      : Number(formValues.adBondFixed || 0)

  return (
    <RoleGuard requiredRole="DEFAULT_ADMIN_ROLE">
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Settings className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Token Configuration (On-chain)</h3>
            <p className="text-slate-400 text-xs">Applies only to new Ads and trades</p>
          </div>
          <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            Admin Only
          </Badge>
        </div>

        <Alert className="bg-amber-500/10 border-amber-500/30 mb-6">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-xs">
            On-chain configuration affects new Ads and trades only. Do not rely on off-chain enforcement.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label className="text-slate-300 text-sm">Chain</Label>
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              {Object.keys(CONTRACT_ADDRESSES).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Token</Label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              {tokens.map((sym) => (
                <option key={sym} value={sym}>
                  {sym}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Label className="text-slate-300 text-sm">Token Enabled</Label>
              <div className="mt-2">
                <Switch
                  checked={formValues.enabled}
                  onCheckedChange={(checked) => setValue("enabled", checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Maker Fee (bps)</Label>
              <Input
                type="number"
                {...register("makerFeeBps", { valueAsNumber: true })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
              {errors.makerFeeBps && (
                <p className="text-xs text-red-400 mt-1">{errors.makerFeeBps.message}</p>
              )}
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Taker Fee (bps)</Label>
              <Input
                type="number"
                {...register("takerFeeBps", { valueAsNumber: true })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
              {errors.takerFeeBps && (
                <p className="text-xs text-red-400 mt-1">{errors.takerFeeBps.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">DisputeBond (bps)</Label>
              <Input
                type="number"
                {...register("disputeBondBps", { valueAsNumber: true })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
              {errors.disputeBondBps && (
                <p className="text-xs text-red-400 mt-1">{errors.disputeBondBps.message}</p>
              )}
            </div>
            <div>
              <Label className="text-slate-300 text-sm">AdBond (bps)</Label>
              <Input
                type="number"
                {...register("adBondBps", { valueAsNumber: true })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
              {errors.adBondBps && (
                <p className="text-xs text-red-400 mt-1">{errors.adBondBps.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Legacy AdBond Fixed (raw)</Label>
              <Input
                type="text"
                {...register("adBondFixed")}
                disabled={!legacyMode}
                className="bg-slate-800 border-slate-700 mt-1"
              />
              {errors.adBondFixed && (
                <p className="text-xs text-red-400 mt-1">{errors.adBondFixed.message}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <Switch checked={legacyMode} onCheckedChange={setLegacyMode} />
                <span className="text-xs text-slate-400">Enable legacy edit</span>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Seller Fund Window (sec)</Label>
              <Input
                type="number"
                {...register("sellerFundWindow", { valueAsNumber: true })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
              {errors.sellerFundWindow && (
                <p className="text-xs text-red-400 mt-1">{errors.sellerFundWindow.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Buyer Confirm Window (sec)</Label>
              <Input
                type="number"
                {...register("buyerConfirmWindow", { valueAsNumber: true })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
              {errors.buyerConfirmWindow && (
                <p className="text-xs text-red-400 mt-1">{errors.buyerConfirmWindow.message}</p>
              )}
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Seller Release Window (sec)</Label>
              <Input
                type="number"
                {...register("sellerReleaseWindow", { valueAsNumber: true })}
                className="bg-slate-800 border-slate-700 mt-1"
              />
              {errors.sellerReleaseWindow && (
                <p className="text-xs text-red-400 mt-1">{errors.sellerReleaseWindow.message}</p>
              )}
            </div>
          </div>

          <Card className="bg-slate-800/50 border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-300">Preview outcomes</p>
              <Input
                type="number"
                value={previewAmount}
                onChange={(e) => setPreviewAmount(Number(e.target.value || 0))}
                className="w-32 bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Maker fee</span>
                <span className="text-white">{makerFee.toFixed(4)} {token}</span>
              </div>
              <div className="flex justify-between">
                <span>Taker fee</span>
                <span className="text-white">{takerFee.toFixed(4)} {token}</span>
              </div>
              <div className="flex justify-between">
                <span>AdBond</span>
                <span className="text-white">{adBond.toFixed(4)} {token}</span>
              </div>
              <div className="flex justify-between">
                <span>DisputeBond</span>
                <span className="text-white">{disputeBond.toFixed(4)} {token}</span>
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            disabled={saving || loading || !account}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting to Blockchain…
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Token Configuration
              </>
            )}
          </Button>
        </form>

        {loading && (
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading on-chain token config…
          </div>
        )}
        {!account && (
          <Alert className="mt-4 bg-amber-500/10 border-amber-500/30">
            <Shield className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300 text-xs">
              Connect an admin wallet to submit on-chain configuration.
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </RoleGuard>
  )
}
