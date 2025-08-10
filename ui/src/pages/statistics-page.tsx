import { useState } from "react";
import { Header } from "@/components/subscription/header";
import { Navigation } from "@/components/subscription/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data
const mockSubscriptionData = {
  monthly: 75.96,
  yearly: 911.52,
  categoryCosts: [
    { name: "Entertainment", value: 33.97 },
    { name: "Software", value: 52.99 },
    { name: "Shopping", value: 11.58 },
    { name: "Health", value: 35 },
    { name: "News", value: 4.99 }
  ],
  monthlyCosts: [
    { name: "Jan", cost: 60.21 },
    { name: "Feb", cost: 60.21 },
    { name: "Mar", cost: 65.20 },
    { name: "Apr", cost: 65.20 },
    { name: "May", cost: 65.20 },
    { name: "Jun", cost: 75.96 },
    { name: "Jul", cost: 75.96 },
    { name: "Aug", cost: 75.96 },
    { name: "Sep", cost: 75.96 },
    { name: "Oct", cost: 75.96 },
    { name: "Nov", cost: 75.96 },
    { name: "Dec", cost: 75.96 }
  ],
  topSubscriptions: [
    { name: "Adobe Creative Cloud", cost: 52.99 },
    { name: "Gym Membership", cost: 35.00 },
    { name: "Netflix", cost: 15.99 },
    { name: "Spotify", cost: 9.99 },
    { name: "Amazon Prime", cost: 11.58 }
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function StatisticsPage() {
  const [timeRange, setTimeRange] = useState<"30days" | "90days" | "6months" | "1year">("30days");
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>

          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Monthly Spending</CardTitle>
                  <CardDescription>Your total monthly subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(mockSubscriptionData.monthly)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Yearly Projection</CardTitle>
                  <CardDescription>Estimated annual cost</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(mockSubscriptionData.yearly)}</div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle>Top Categories</CardTitle>
                  <CardDescription>Spending by category</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockSubscriptionData.categoryCosts}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {mockSubscriptionData.categoryCosts.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Subscriptions</CardTitle>
                <CardDescription>Your most expensive subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSubscriptionData.topSubscriptions.map((subscription, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {index + 1}
                        </div>
                        <span className="ml-4 font-medium">{subscription.name}</span>
                      </div>
                      <span>{formatCurrency(subscription.cost)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>How your spending is distributed</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockSubscriptionData.categoryCosts}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockSubscriptionData.categoryCosts.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>How your spending has changed over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockSubscriptionData.monthlyCosts}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="cost" name="Monthly Cost" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Navigation />
    </div>
  );
}
