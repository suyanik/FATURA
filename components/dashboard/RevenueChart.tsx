"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/currency'

interface RevenueChartProps {
    data: Array<{ month: string; revenue: number }>
    currency: string
}

export function RevenueChart({ data, currency }: RevenueChartProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Umsatz (Letzte 6 Monate)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                                formatter={(value: number | undefined) =>
                                    formatCurrency(value || 0, currency as 'EUR' | 'USD' | 'TRY')
                                }
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                dot={{ r: 4, fill: 'var(--background)', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                                name="Umsatz"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
