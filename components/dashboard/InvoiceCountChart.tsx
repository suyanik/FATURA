"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

interface InvoiceCountChartProps {
    data: Array<{ month: string; count: number }>
}

export function InvoiceCountChart({ data }: InvoiceCountChartProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Rechnungsanzahl (Letzte 6 Monate)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                                cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                            />
                            <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Anzahl" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
