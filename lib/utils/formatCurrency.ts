export const formatCurrency = (v: number) =>
  v?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
