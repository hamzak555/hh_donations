import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Truck, 
  Users, 
  DollarSign,
  MapPin,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  PackageCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Archive
} from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Chart components
import { ChartContainer, ChartConfig } from '@/components/ui/chart-container';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  LabelList
} from 'recharts';

// Import contexts
import { useBins } from '@/contexts/BinsContextSupabase';
import { usePickupRequests } from '@/contexts/PickupRequestsContextSupabase';
import { useDrivers } from '@/contexts/DriversContextSupabase';
import { useBales } from '@/contexts/BalesContextSupabase';
import { useContainers } from '@/contexts/ContainersContextSupabase';
import { usePartnerApplications } from '@/contexts/PartnerApplicationsContextSupabase';

// Brand colors - matching H&H Donations green theme
const chartColors = {
  primary: "#22c55e",     // Brand green
  secondary: "#16a34a",   // Darker green
  accent: "#86efac",      // Light green
  warning: "#f59e0b",     // Amber
  danger: "#ef4444",      // Red
  info: "#3b82f6",        // Blue
  gray: "#6b7280",        // Gray
  success: "#10b981",     // Success green
  purple: "#8b5cf6",      // Purple
  teal: "#14b8a6",        // Teal
  orange: "#fb923c",      // Orange
  dark: "#15803d"         // Dark green
};

interface QuickRange {
  label: string;
  days?: number;
  months?: number;
  years?: number;
}

const quickRanges: QuickRange[] = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
  { label: '6m', months: 6 },
  { label: '1y', years: 1 }
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].value}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom label component
const CustomLabel = ({ x, y, width, height, value }: any) => {
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-foreground text-sm font-medium"
    >
      {value}
    </text>
  );
};

function Reporting() {
  const { bins } = useBins();
  const { pickupRequests } = usePickupRequests();
  const { drivers } = useDrivers();
  const { bales } = useBales();
  const { containers } = useContainers();
  const { applications } = usePartnerApplications();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const [activeTab, setActiveTab] = useState('operational');

  // Quick range selection
  const handleQuickRange = (range: QuickRange) => {
    const to = new Date();
    let from = new Date();
    
    if (range.days) {
      from = subDays(to, range.days);
    } else if (range.months) {
      from = subMonths(to, range.months);
    } else if (range.years) {
      from = subYears(to, range.years);
    }
    
    setDateRange({ from: startOfDay(from), to: endOfDay(to) });
  };

  // Filter data based on date range
  const filterByDateRange = <T extends { [key: string]: any }>(
    data: T[],
    dateField: keyof T
  ): T[] => {
    if (!dateRange?.from || !dateRange?.to) return data;
    
    return data.filter(item => {
      const itemDate = item[dateField];
      if (!itemDate) return false;
      
      const date = new Date(itemDate);
      return isWithinInterval(date, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      });
    });
  };

  // Operational Metrics
  const binMetrics = useMemo(() => {
    const activeBins = bins.filter(bin => bin.status !== 'Unavailable');
    const inactiveBins = bins.filter(bin => bin.status === 'Unavailable');
    const availableBins = bins.filter(bin => bin.status === 'Available');
    const fullBins = bins.filter(bin => bin.status === 'Full');
    const almostFullBins = bins.filter(bin => bin.status === 'Almost Full');
    
    return {
      active: activeBins.length,
      inactive: inactiveBins.length,
      available: availableBins.length,
      full: fullBins.length,
      almostFull: almostFullBins.length,
      total: bins.length,
      pieData: [
        { name: 'Available', value: availableBins.length, fill: chartColors.primary },
        { name: 'Full', value: fullBins.length, fill: chartColors.danger },
        { name: 'Almost Full', value: almostFullBins.length, fill: chartColors.warning },
        { name: 'Unavailable', value: inactiveBins.length, fill: chartColors.gray }
      ]
    };
  }, [bins]);

  const driverBinAssignments = useMemo(() => {
    const assignments: { [key: string]: number } = {};
    
    drivers.forEach(driver => {
      const driverBins = bins.filter(bin => bin.assignedDriver === driver.name);
      assignments[driver.name] = driverBins.length;
    });
    
    return Object.entries(assignments).map(([name, count]) => ({
      driver: name,
      bins: count
    }));
  }, [bins, drivers]);

  const pickupMetrics = useMemo(() => {
    const filtered = filterByDateRange(pickupRequests, 'date');
    
    const pending = filtered.filter(req => req.status === 'Pending');
    const overdue = filtered.filter(req => req.status === 'Overdue');
    const pickedUp = filtered.filter(req => req.status === 'Picked Up');
    const cancelled = filtered.filter(req => req.status === 'Cancelled');
    
    return {
      total: filtered.length,
      pending: pending.length,
      overdue: overdue.length,
      pickedUp: pickedUp.length,
      cancelled: cancelled.length,
      chartData: [
        { name: 'Pending', value: pending.length, fill: chartColors.warning },
        { name: 'Overdue', value: overdue.length, fill: chartColors.danger },
        { name: 'Picked Up', value: pickedUp.length, fill: chartColors.success },
        { name: 'Cancelled', value: cancelled.length, fill: chartColors.gray }
      ]
    };
  }, [pickupRequests, dateRange]);

  const pickupsPerDriver = useMemo(() => {
    const filtered = filterByDateRange(pickupRequests, 'date');
    const driverPickups: { [key: string]: number } = {};
    
    filtered.forEach(request => {
      if (request.assignedDriver) {
        driverPickups[request.assignedDriver] = (driverPickups[request.assignedDriver] || 0) + 1;
      }
    });
    
    return Object.entries(driverPickups).map(([driver, pickups]) => ({
      driver,
      pickups
    }));
  }, [pickupRequests, dateRange]);

  const partnerMetrics = useMemo(() => {
    const approved = applications.filter(app => app.status === 'approved');
    const pending = applications.filter(app => app.status === 'pending');
    const rejected = applications.filter(app => app.status === 'rejected');
    const archived = applications.filter(app => app.status === 'archived');
    
    return {
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      archived: archived.length,
      chartData: [
        { name: 'Approved', value: approved.length, fill: chartColors.primary },
        { name: 'Pending', value: pending.length, fill: chartColors.warning },
        { name: 'Rejected', value: rejected.length, fill: chartColors.danger },
        { name: 'Archived', value: archived.length, fill: chartColors.gray }
      ]
    };
  }, [applications]);

  // Financial Metrics
  const salesMetrics = useMemo(() => {
    const soldBales = filterByDateRange(
      bales.filter(bale => bale.status === 'Sold'),
      'soldDate'
    );
    
    // Unsold bales (active inventory)
    const unsoldBales = bales.filter(bale => bale.status !== 'Sold');
    const unsoldWeight = unsoldBales.reduce((sum, bale) => sum + (bale.weight || 0), 0);
    
    // Unsold by status
    const warehouseBales = unsoldBales.filter(b => b.status === 'Warehouse');
    const containerBales = unsoldBales.filter(b => b.status === 'Container');
    const shippedBales = unsoldBales.filter(b => b.status === 'Shipped');
    
    const totalSales = soldBales.reduce((sum, bale) => sum + (bale.salePrice || 0), 0);
    const totalWeight = soldBales.reduce((sum, bale) => sum + (bale.weight || 0), 0);
    const avgPricePerKg = totalWeight > 0 ? totalSales / totalWeight : 0;
    
    // Sales by location
    const salesByLocation: { [key: string]: number } = {};
    soldBales.forEach(bale => {
      let location = 'Local';
      if (bale.containerNumber) {
        const container = containers.find(c => c.containerNumber === bale.containerNumber);
        if (container?.destination) {
          location = container.destination;
        }
      }
      salesByLocation[location] = (salesByLocation[location] || 0) + (bale.salePrice || 0);
    });
    
    // Sales by quality
    const salesByQuality: { [key: string]: { count: number; revenue: number } } = {};
    soldBales.forEach(bale => {
      const quality = bale.contents;
      if (!salesByQuality[quality]) {
        salesByQuality[quality] = { count: 0, revenue: 0 };
      }
      salesByQuality[quality].count++;
      salesByQuality[quality].revenue += bale.salePrice || 0;
    });
    
    // Unsold by quality
    const unsoldByQuality: { [key: string]: number } = {};
    unsoldBales.forEach(bale => {
      unsoldByQuality[bale.contents] = (unsoldByQuality[bale.contents] || 0) + 1;
    });
    
    return {
      count: soldBales.length,
      unsoldCount: unsoldBales.length,
      warehouseCount: warehouseBales.length,
      containerCount: containerBales.length,
      shippedCount: shippedBales.length,
      totalSales,
      totalWeight,
      unsoldWeight,
      avgPricePerKg,
      byLocation: Object.entries(salesByLocation).map(([location, amount]) => ({
        location,
        amount
      })),
      byQuality: Object.entries(salesByQuality).map(([quality, data]) => ({
        quality,
        count: data.count,
        revenue: data.revenue
      })),
      unsoldByQuality: Object.entries(unsoldByQuality).map(([quality, count]) => ({
        quality,
        count
      }))
    };
  }, [bales, containers, dateRange]);

  const containerMetrics = useMemo(() => {
    const shippedContainers = filterByDateRange(
      containers.filter(c => c.status === 'Shipped'),
      'shipmentDate'
    );
    
    // Unshipped containers
    const unshippedContainers = containers.filter(c => c.status === 'Warehouse');
    
    // Calculate unshipped container stats
    let unshippedBales = 0;
    let unshippedWeight = 0;
    unshippedContainers.forEach(container => {
      const containerBales = bales.filter(b => b.containerNumber === container.containerNumber);
      unshippedBales += containerBales.length;
      unshippedWeight += containerBales.reduce((sum, bale) => sum + (bale.weight || 0), 0);
    });
    
    const destinations = new Set(shippedContainers.map(c => c.destination));
    
    // Calculate shipped averages
    let totalBales = 0;
    let totalWeight = 0;
    
    shippedContainers.forEach(container => {
      const containerBales = bales.filter(b => b.containerNumber === container.containerNumber);
      totalBales += containerBales.length;
      totalWeight += containerBales.reduce((sum, bale) => sum + (bale.weight || 0), 0);
    });
    
    const avgBalesPerContainer = shippedContainers.length > 0 ? totalBales / shippedContainers.length : 0;
    const avgWeightPerContainer = shippedContainers.length > 0 ? totalWeight / shippedContainers.length : 0;
    
    // Destinations list
    const destinationCounts: { [key: string]: number } = {};
    shippedContainers.forEach(container => {
      destinationCounts[container.destination] = (destinationCounts[container.destination] || 0) + 1;
    });
    
    return {
      shippedCount: shippedContainers.length,
      unshippedCount: unshippedContainers.length,
      unshippedBales,
      unshippedWeight,
      uniqueDestinations: destinations.size,
      avgBalesPerContainer,
      avgWeightPerContainer,
      destinations: Object.entries(destinationCounts).map(([destination, count]) => ({
        destination,
        containers: count
      }))
    };
  }, [containers, bales, dateRange]);

  // Chart configs
  const binStatusConfig: ChartConfig = {
    available: { label: "Available", color: chartColors.primary },
    full: { label: "Full", color: chartColors.danger },
    almostFull: { label: "Almost Full", color: chartColors.warning },
    unavailable: { label: "Unavailable", color: chartColors.gray }
  };

  const pickupStatusConfig: ChartConfig = {
    pending: { label: "Pending", color: chartColors.warning },
    overdue: { label: "Overdue", color: chartColors.danger },
    pickedUp: { label: "Picked Up", color: chartColors.success },
    cancelled: { label: "Cancelled", color: chartColors.gray }
  };

  return (
    <div className="h-screen flex flex-col pt-10 pb-6 bg-gradient-to-br from-green-50 to-white">
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-900">Analytics & Reporting</h1>
            <p className="text-sm text-gray-600 mt-1">Track your operational and financial performance</p>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            {/* Quick Range Buttons */}
            {quickRanges.map(range => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickRange(range)}
                className={
                  dateRange?.from && dateRange?.to &&
                  ((range.days && 
                    Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) === range.days) ||
                   (range.months && 
                    Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) === range.months * 30) ||
                   (range.years && 
                    Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) === range.years * 365))
                  ? 'bg-primary text-primary-foreground'
                  : ''
                }
              >
                {range.label}
              </Button>
            ))}
            
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[240px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from && dateRange?.to ? (
                    <>
                      {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                    </>
                  ) : (
                    'Select date range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="operational">Operational</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          {/* Operational Tab */}
          <TabsContent value="operational" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Bins Overview */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-green-800">Bins Overview</CardTitle>
                  <CardDescription>Active vs Inactive bins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-700">{binMetrics.active}</div>
                      <div className="text-xs text-gray-600">Active</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-50">
                      <div className="text-2xl font-bold text-gray-700">{binMetrics.inactive}</div>
                      <div className="text-xs text-gray-600">Inactive</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-50">
                      <div className="text-2xl font-bold text-blue-700">{binMetrics.total}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bin Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Bin Status Distribution</CardTitle>
                  <CardDescription>Current status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={binStatusConfig} className="h-[200px]">
                    <PieChart>
                      <Pie
                        data={binMetrics.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {binMetrics.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {binMetrics.pieData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.fill }}
                        />
                        <span>{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bins per Driver */}
              <Card>
                <CardHeader>
                  <CardTitle>Bins per Driver</CardTitle>
                  <CardDescription>Driver assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <BarChart data={driverBinAssignments}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="driver" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="bins" 
                        fill={chartColors.primary} 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Pickup Requests Status */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-green-800">Pickup Requests</CardTitle>
                  <CardDescription>Status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-gray-50">
                      <div className="text-xl font-bold">{pickupMetrics.total}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-green-50">
                      <div className="text-xl font-bold text-green-700">{pickupMetrics.pickedUp}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-yellow-50">
                      <div className="text-xl font-bold text-yellow-700">{pickupMetrics.pending}</div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-red-50">
                      <div className="text-xl font-bold text-red-700">{pickupMetrics.overdue}</div>
                      <div className="text-xs text-gray-600">Overdue</div>
                    </div>
                  </div>
                  {pickupMetrics.total > 0 ? (
                    <ChartContainer config={pickupStatusConfig} className="h-[180px]">
                      <PieChart>
                        <Pie
                          data={pickupMetrics.chartData.filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pickupMetrics.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-gray-400">
                      <p className="text-sm">No pickup requests in selected period</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pickups per Driver */}
              <Card>
                <CardHeader>
                  <CardTitle>Pickups per Driver</CardTitle>
                  <CardDescription>Performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <BarChart data={pickupsPerDriver}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="driver" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="pickups" 
                        fill={chartColors.info} 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Partner Applications */}
              <Card>
                <CardHeader>
                  <CardTitle>Partner Applications</CardTitle>
                  <CardDescription>Application status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <PieChart>
                      <Pie
                        data={partnerMetrics.chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {partnerMetrics.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-700">${salesMetrics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
                  <div className="text-xs text-gray-500 mt-2">{salesMetrics.count} bales sold</div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-700">{salesMetrics.unsoldCount}</div>
                  <p className="text-sm text-gray-600 mt-1">Unsold Inventory</p>
                  <div className="text-xs text-gray-500 mt-2">{salesMetrics.unsoldWeight.toFixed(0)} kg total</div>
                </CardContent>
              </Card>
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-700">{containerMetrics.unshippedCount}</div>
                  <p className="text-sm text-gray-600 mt-1">Containers in Warehouse</p>
                  <div className="text-xs text-gray-500 mt-2">{containerMetrics.unshippedBales} bales ready</div>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-700">{containerMetrics.shippedCount}</div>
                  <p className="text-sm text-gray-600 mt-1">Containers Shipped</p>
                  <div className="text-xs text-gray-500 mt-2">{containerMetrics.uniqueDestinations} destinations</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Sales & Inventory Overview */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-green-800">Sales & Inventory</CardTitle>
                  <CardDescription>Current status overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-sm text-gray-700">Revenue</span>
                      <span className="font-bold text-green-700">
                        ${salesMetrics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">Sold Weight</span>
                      <span className="font-bold">{salesMetrics.totalWeight.toFixed(0)} kg</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                      <span className="text-sm text-gray-700">Avg Price/kg</span>
                      <span className="font-bold text-blue-700">
                        ${salesMetrics.avgPricePerKg.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="text-xs font-semibold text-gray-600 mb-2">UNSOLD INVENTORY</div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-orange-50">
                        <span className="text-sm text-gray-700">In Warehouse</span>
                        <span className="font-bold text-orange-700">{salesMetrics.warehouseCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50 mt-1">
                        <span className="text-sm text-gray-700">In Containers</span>
                        <span className="font-bold text-purple-700">{salesMetrics.containerCount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales by Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Location</CardTitle>
                  <CardDescription>Revenue distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <BarChart data={salesMetrics.byLocation}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="location" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill={chartColors.primary} 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Sales by Quality */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Quality</CardTitle>
                  <CardDescription>Content breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <BarChart data={salesMetrics.byQuality}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="quality" className="text-xs" />
                      <YAxis yAxisId="left" orientation="left" stroke={chartColors.primary} className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" stroke={chartColors.secondary} className="text-xs" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        yAxisId="left" 
                        dataKey="count" 
                        fill={chartColors.primary} 
                        name="Count"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="revenue" 
                        fill={chartColors.secondary} 
                        name="Revenue ($)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Unsold Inventory by Quality */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="text-orange-800">Unsold Inventory</CardTitle>
                  <CardDescription>By quality type</CardDescription>
                </CardHeader>
                <CardContent>
                  {salesMetrics.unsoldByQuality.length > 0 ? (
                    <ChartContainer config={{}} className="h-[200px]">
                      <BarChart data={salesMetrics.unsoldByQuality}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="quality" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="count" 
                          fill={chartColors.orange}
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-400">
                      <p className="text-sm">No unsold inventory</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Container Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Container Operations</CardTitle>
                  <CardDescription>Shipping & warehouse status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-sm text-gray-700">Shipped</span>
                      <span className="font-bold text-green-700">{containerMetrics.shippedCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-orange-50">
                      <span className="text-sm text-gray-700">In Warehouse</span>
                      <span className="font-bold text-orange-700">{containerMetrics.unshippedCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">Destinations</span>
                      <span className="font-bold">{containerMetrics.uniqueDestinations}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-xs font-semibold text-gray-600 mb-2">AVERAGES</div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                        <span className="text-sm text-gray-700">Bales/Container</span>
                        <span className="font-bold text-blue-700">{containerMetrics.avgBalesPerContainer.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50 mt-1">
                        <span className="text-sm text-gray-700">Weight/Container</span>
                        <span className="font-bold text-purple-700">{containerMetrics.avgWeightPerContainer.toFixed(0)} kg</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Destinations Chart */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Shipping Destinations</CardTitle>
                  <CardDescription>Container distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <BarChart data={containerMetrics.destinations}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="destination" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="containers" 
                        fill={chartColors.info} 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                  <ScrollArea className="h-32 mt-4">
                    <div className="space-y-2">
                      {containerMetrics.destinations.map((dest, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted">
                          <span className="text-sm font-medium">{dest.destination}</span>
                          <Badge variant="outline">{dest.containers} containers</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Reporting;