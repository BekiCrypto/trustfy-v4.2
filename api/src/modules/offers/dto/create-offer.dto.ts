export class CreateOfferDto {
  type: string // BUY | SELL
  token: string
  currency: string
  priceType: string // FIXED | MARKET
  price: number
  minAmount: number
  maxAmount: number
  paymentMethods: string[]
  terms?: string
}
