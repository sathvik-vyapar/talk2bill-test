import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import {
  TrendingUp, Database, Users, MessageSquare, CheckCircle, XCircle,
  Clock, Mic, IndianRupee, ShoppingCart, FileText, Calendar
} from 'lucide-react';

// Production Data Summary (Nov 7-15, 2025)
const dataSnapshot = {
  dateRange: 'Nov 7 - Nov 15, 2025',
  lastUpdated: 'November 15, 2025',
  totalRecords: 2381,
  uniqueSessions: 1330,
  totalItems: 1711,
  totalAmount: 3302340.14,
};

// Daily distribution data
const dailyData = [
  { date: 'Nov 7', records: 14 },
  { date: 'Nov 9', records: 7 },
  { date: 'Nov 10', records: 47 },
  { date: 'Nov 11', records: 120 },
  { date: 'Nov 12', records: 352 },
  { date: 'Nov 13', records: 696 },
  { date: 'Nov 14', records: 873 },
  { date: 'Nov 15', records: 272 },
];

// Status distribution
const statusData = [
  { name: 'T2I Completed', value: 2185, percentage: 91.8, color: '#10B981' },
  { name: 'Invoice Ready', value: 149, percentage: 6.3, color: '#3B82F6' },
  { name: 'Failed', value: 47, percentage: 2.0, color: '#EF4444' },
];

// Intent distribution
const intentData = [
  { name: 'Expense', value: 1620, percentage: 68.0, color: '#8B5CF6' },
  { name: 'Other', value: 714, percentage: 30.0, color: '#F59E0B' },
  { name: 'Unknown', value: 47, percentage: 2.0, color: '#6B7280' },
];

// Top expense categories
const categoryData = [
  { name: 'Food', count: 241 },
  { name: 'Fuel', count: 137 },
  { name: 'Transport', count: 108 },
  { name: 'Salary', count: 83 },
  { name: 'Utilities', count: 50 },
  { name: 'Shopping', count: 27 },
  { name: 'Multi', count: 13 },
  { name: 'Medical', count: 10 },
  { name: 'Home', count: 9 },
  { name: 'Personal', count: 6 },
];

// Top items
const topItems = [
  { name: 'Petrol', count: 106 },
  { name: 'Tea', count: 83 },
  { name: 'Apple', count: 59 },
  { name: 'Samosa', count: 47 },
  { name: 'Water', count: 31 },
  { name: 'Milk', count: 27 },
  { name: 'Bank Charges', count: 26 },
  { name: 'Food', count: 21 },
  { name: 'Diesel', count: 19 },
  { name: 'Coffee', count: 18 },
];

// Payment types
const paymentData = [
  { name: 'Cash', value: 2273, percentage: 95.5, color: '#10B981' },
  { name: 'Bank Transfer', value: 65, percentage: 2.7, color: '#3B82F6' },
  { name: 'Credit', value: 43, percentage: 1.8, color: '#F59E0B' },
];

// Sample transcriptions
const sampleTranscriptions = [
  { text: "Apple for 100 rupees.", intent: "expense", category: "food" },
  { text: "Tax expense for 100 rupees.", intent: "expense", category: "tax" },
  { text: "Create expense of 100 rupees for item apple.", intent: "expense", category: "food" },
  { text: "Add Apple for 100.", intent: "expense", category: "food" },
  { text: "Petrol 500 rupees.", intent: "expense", category: "fuel" },
  { text: "Chai samosa 140 rupees.", intent: "expense", category: "food" },
  { text: "Salary for Ramesh 15000.", intent: "expense", category: "salary" },
  { text: "Electricity bill 2500.", intent: "expense", category: "utilities" },
];

const ProductionInsights = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Insights</h1>
          <p className="text-gray-600">VAANI voice-to-invoice production data analysis</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Data Period: {dataSnapshot.dateRange}
          </span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-500">Total Records</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dataSnapshot.totalRecords.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-xs text-gray-500">Sessions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dataSnapshot.uniqueSessions.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-gray-500">Items Tracked</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dataSnapshot.totalItems.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-yellow-500" />
              <span className="text-xs text-gray-500">Total Amount</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {(dataSnapshot.totalAmount / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-xs text-gray-500">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">98%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-500">Expense Intent</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">68%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="items">Top Items</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Daily Voice Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="records"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="Requests"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Intent Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  Intent Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={intentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {intentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {intentData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Processing Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${percentage}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-yellow-500" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${percentage}%`}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {paymentData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Expense Categories</CardTitle>
              <p className="text-sm text-gray-500">
                Distribution of expense categories from voice inputs
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-green-800">Top Category</h3>
                <p className="text-2xl font-bold text-green-900 mt-1">Food</p>
                <p className="text-sm text-green-700">241 transactions (14.1%)</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-800">Fastest Growing</h3>
                <p className="text-2xl font-bold text-blue-900 mt-1">Fuel</p>
                <p className="text-sm text-blue-700">137 transactions (petrol/diesel)</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-purple-800">Business Expense</h3>
                <p className="text-2xl font-bold text-purple-900 mt-1">Salary</p>
                <p className="text-sm text-purple-700">83 transactions tracked</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Tracked Items</CardTitle>
              <p className="text-sm text-gray-500">
                Items frequently mentioned in voice expense entries
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Item Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {topItems.slice(0, 5).map((item, index) => (
              <Card key={item.name}>
                <CardContent className="p-4 text-center">
                  <Badge variant="outline" className="mb-2">#{index + 1}</Badge>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.count} times</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Samples Tab */}
        <TabsContent value="samples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Sample Voice Transcriptions
              </CardTitle>
              <p className="text-sm text-gray-500">
                Examples of voice inputs processed by VAANI
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleTranscriptions.map((sample, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Mic className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">"{sample.text}"</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{sample.intent}</Badge>
                        <Badge variant="outline">{sample.category}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>68% expense intent</strong> - Users primarily use voice for expense tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>98% success rate</strong> - High accuracy in processing voice commands</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Food & Fuel dominate</strong> - Top categories for daily business expenses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Growing adoption</strong> - 60x increase from Nov 7 to Nov 14</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Cash is king</strong> - 95.5% transactions recorded as cash payments</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionInsights;
