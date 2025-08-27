import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  Archive,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Chart components
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
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

// Using CSS variables for consistent theming
const chartColors = {
  danger: "hsl(var(--destructive))",
  gray: "hsl(var(--muted-foreground))",
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

  const [activeTab, setActiveTab] = useState('financial');
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);

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
    
    // TypeScript needs explicit type narrowing here
    const rangeStart = dateRange.from;
    const rangeEnd = dateRange.to;
    
    return data.filter(item => {
      const itemDate = item[dateField];
      if (!itemDate) return false;
      
      const date = new Date(itemDate);
      return isWithinInterval(date, {
        start: startOfDay(rangeStart),
        end: endOfDay(rangeEnd)
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
        { name: 'Available', value: availableBins.length },
        { name: 'Full', value: fullBins.length },
        { name: 'Almost Full', value: almostFullBins.length },
        { name: 'Unavailable', value: inactiveBins.length }
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
        { name: 'Pending', value: pending.length },
        { name: 'Overdue', value: overdue.length },
        { name: 'Picked Up', value: pickedUp.length },
        { name: 'Cancelled', value: cancelled.length }
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
        { name: 'Approved', value: approved.length },
        { name: 'Pending', value: pending.length },
        { name: 'Rejected', value: rejected.length },
        { name: 'Archived', value: archived.length }
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
    // Combine Container and Shipped status into single "Shipped" category
    const shippedBales = unsoldBales.filter(b => b.status === 'Container' || b.status === 'Shipped');
    
    const totalSales = soldBales.reduce((sum, bale) => sum + (bale.salePrice || 0), 0);
    const totalWeight = soldBales.reduce((sum, bale) => sum + (bale.weight || 0), 0);
    const avgPricePerKg = totalWeight > 0 ? totalSales / totalWeight : 0;
    
    // Sales by location
    const salesByLocation: { [key: string]: number } = {};
    soldBales.forEach(bale => {
      let location = 'Warehouse';
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
    
    // Unsold by quality - include all quality types
    const allQualityTypes = ['A-Quality', 'B-Quality', 'C-Quality', 'Creme', 'Shoes'];
    const unsoldByQuality: { [key: string]: number } = {};
    
    // Initialize all quality types with 0
    allQualityTypes.forEach(quality => {
      unsoldByQuality[quality] = 0;
    });
    
    // Count actual unsold bales
    unsoldBales.forEach(bale => {
      if (unsoldByQuality.hasOwnProperty(bale.contents)) {
        unsoldByQuality[bale.contents]++;
      } else {
        // Handle any quality types not in our predefined list
        unsoldByQuality[bale.contents] = (unsoldByQuality[bale.contents] || 0) + 1;
      }
    });
    
    return {
      count: soldBales.length,
      unsoldCount: unsoldBales.length,
      warehouseCount: warehouseBales.length,
      shippedCount: shippedBales.length,
      totalSales,
      totalWeight,
      unsoldWeight,
      avgPricePerKg,
      byLocation: Object.entries(salesByLocation).map(([location, amount]) => ({
        location: location.split(',')[0].trim(),
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
    const shippedContainers = containers.filter(c => c.status === 'Shipped' || c.status === 'In Transit' || c.status === 'Delivered');
    
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
    
    // Calculate averages using all containers with bales
    let totalBales = 0;
    let totalWeight = 0;
    let containersWithBales = 0;
    
    containers.forEach(container => {
      const containerBales = bales.filter(b => b.containerNumber === container.containerNumber);
      if (containerBales.length > 0) {
        containersWithBales++;
        totalBales += containerBales.length;
        totalWeight += containerBales.reduce((sum, bale) => sum + (bale.weight || 0), 0);
      }
    });
    
    const avgBalesPerContainer = containersWithBales > 0 ? totalBales / containersWithBales : 0;
    const avgWeightPerContainer = containersWithBales > 0 ? totalWeight / containersWithBales : 0;
    
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

  // Chart configs - using monochromatic green theme based on #14532d
  const greenColors = {
    darkest: "#14532d",   // Base color
    dark: "#1e7e34",      // Lighter shade 1
    medium: "#28a745",    // Lighter shade 2
    light: "#40c463",     // Lighter shade 3
    lighter: "#6fd788",   // Lighter shade 4
    lightest: "#9ae6b4"   // Lighter shade 5
  };

  const binStatusConfig = {
    available: { label: "Available", color: greenColors.medium },
    full: { label: "Full", color: greenColors.darkest },
    almostFull: { label: "Almost Full", color: greenColors.light },
    unavailable: { label: "Unavailable", color: greenColors.lighter }
  } satisfies ChartConfig;

  const pickupStatusConfig = {
    pending: { label: "Pending", color: greenColors.light },
    overdue: { label: "Overdue", color: greenColors.darkest },
    pickedUp: { label: "Picked Up", color: greenColors.medium },
    cancelled: { label: "Cancelled", color: greenColors.lighter }
  } satisfies ChartConfig;

  const driverConfig = {
    bins: { label: "Assigned Bins", color: greenColors.medium },
  } satisfies ChartConfig;

  const pickupsConfig = {
    pickups: { label: "Pickups", color: greenColors.medium },
  } satisfies ChartConfig;

  const partnerConfig = {
    approved: { label: "Approved", color: greenColors.medium },
    pending: { label: "Pending", color: greenColors.light },
    rejected: { label: "Rejected", color: greenColors.darkest },
    archived: { label: "Archived", color: greenColors.lighter }
  } satisfies ChartConfig;

  const salesConfig = {
    sales: { label: "Sales", color: greenColors.medium },
    count: { label: "Count", color: greenColors.medium },
    revenue: { label: "Revenue", color: greenColors.dark },
    unsold: { label: "Unsold", color: greenColors.lighter },
  } satisfies ChartConfig;

  const containerConfig = {
    containers: { label: "Containers", color: greenColors.light },
  } satisfies ChartConfig;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
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
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="operational">Operational</TabsTrigger>
          </TabsList>

          {/* Operational Tab */}
          <TabsContent value="operational" className="space-y-6 mb-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold" style={{ color: '#0b503c' }}>{binMetrics.total}</div>
                  <p className="text-sm text-gray-600 mt-1">Total Bins</p>
                  <div className="text-xs text-gray-500 mt-2">{binMetrics.active} active</div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold" style={{ color: '#0b503c' }}>{pickupMetrics.total}</div>
                  <p className="text-sm text-gray-600 mt-1">Pickup Requests</p>
                  <div className="text-xs text-gray-500 mt-2">{pickupMetrics.pickedUp} completed</div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold" style={{ color: '#0b503c' }}>{driverBinAssignments.length}</div>
                  <p className="text-sm text-gray-600 mt-1">Active Drivers</p>
                  <div className="text-xs text-gray-500 mt-2">{driverBinAssignments.reduce((sum, d) => sum + d.bins, 0)} bins assigned</div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold" style={{ color: '#0b503c' }}>{partnerMetrics.approved}</div>
                  <p className="text-sm text-gray-600 mt-1">Active Partners</p>
                  <div className="text-xs text-gray-500 mt-2">{partnerMetrics.pending} pending</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              
              {/* Bins Overview */}
              <Card className="border-l-4 border-l-[#0b503c]">
                <CardHeader>
                  <CardTitle className="text-lg">Bins Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">Active Bins</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{binMetrics.active}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">Inactive Bins</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{binMetrics.inactive}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">Total Bins</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{binMetrics.total}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">Utilization</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{Math.round((binMetrics.active / binMetrics.total) * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bin Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bin Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    bins: {
                      label: "Bins",
                      color: "#0b503c",
                    },
                    label: {
                      color: "var(--background)",
                    },
                  }} className="h-[200px]">
                    <BarChart
                      accessibilityLayer
                      data={binMetrics.pieData.map(item => ({ status: item.name, bins: item.value }))}
                      layout="vertical"
                      margin={{ right: 100 }}
                    >
                      <Bar dataKey="bins" layout="vertical" fill="#0b503c" radius={4} maxBarSize={40}>
                        <LabelList dataKey="status" position="right" offset={8} className="fill-foreground" fontSize={11} dy={-6} />
                        <LabelList dataKey="bins" position="right" offset={8} dy={6} className="fill-muted-foreground" fontSize={10} />
                      </Bar>
                      <ChartTooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-sm">
                                <div className="text-sm font-medium">{data.status}</div>
                                <div className="text-sm text-muted-foreground">
                                  Bins: {data.bins}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Bins per Driver */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bins per Driver</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    bins: {
                      label: "Bins",
                      color: "#0b503c",
                    },
                    label: {
                      color: "var(--background)",
                    },
                  }} className="h-[200px]">
                    <BarChart
                      accessibilityLayer
                      data={driverBinAssignments}
                      layout="vertical"
                      margin={{ right: 100 }}
                    >
                      <YAxis dataKey="driver" type="category" hide />
                      <XAxis type="number" hide />
                      <Bar dataKey="bins" layout="vertical" fill="#0b503c" radius={4} maxBarSize={40}>
                        <LabelList dataKey="driver" position="right" offset={8} className="fill-foreground" fontSize={11} dy={-6} />
                        <LabelList dataKey="bins" position="right" offset={8} dy={6} className="fill-muted-foreground" fontSize={10} />
                      </Bar>
                      <ChartTooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-sm">
                                <div className="text-sm font-medium">{data.driver}</div>
                                <div className="text-sm text-muted-foreground">
                                  Bins: {data.bins}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Pickup Requests Status */}
              <Card className="border-l-4 border-l-[#0b503c]">
                <CardHeader>
                  <CardTitle className="text-lg">Pickup Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-sm text-gray-700">Total</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{pickupMetrics.total}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-sm text-gray-700">Completed</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{pickupMetrics.pickedUp}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-sm text-gray-700">Pending</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{pickupMetrics.pending}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-sm text-gray-700">Overdue</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{pickupMetrics.overdue}</span>
                    </div>
                  </div>
                  {pickupMetrics.total === 0 && (
                    <div className="mt-4 flex items-center justify-center text-gray-400">
                      <p className="text-sm">No pickup requests in selected period</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pickups per Driver */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pickups per Driver</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    pickups: {
                      label: "Pickups",
                      color: "#0b503c",
                    },
                    label: {
                      color: "var(--background)",
                    },
                  }} className="h-[200px]">
                    <BarChart
                      accessibilityLayer
                      data={pickupsPerDriver}
                      layout="vertical"
                      margin={{ right: 100 }}
                    >
                      <Bar dataKey="pickups" layout="vertical" fill="#0b503c" radius={4} maxBarSize={40}>
                        <LabelList dataKey="driver" position="right" offset={8} className="fill-foreground" fontSize={11} dy={-6} />
                        <LabelList dataKey="pickups" position="right" offset={8} dy={6} className="fill-muted-foreground" fontSize={10} />
                      </Bar>
                      <ChartTooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-sm">
                                <div className="text-sm font-medium">{data.driver}</div>
                                <div className="text-sm text-muted-foreground">
                                  Pickups: {data.pickups}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Partner Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Partner Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    applications: {
                      label: "Applications",
                      color: "#0b503c",
                    },
                    label: {
                      color: "var(--background)",
                    },
                  }} className="h-[200px]">
                    <BarChart
                      accessibilityLayer
                      data={partnerMetrics.chartData.map(item => ({ status: item.name, applications: item.value }))}
                      layout="vertical"
                      margin={{ right: 100 }}
                    >
                      <Bar dataKey="applications" layout="vertical" fill="#0b503c" radius={4} maxBarSize={40}>
                        <LabelList dataKey="status" position="right" offset={8} className="fill-foreground" fontSize={11} dy={-6} />
                        <LabelList dataKey="applications" position="right" offset={8} dy={6} className="fill-muted-foreground" fontSize={10} />
                      </Bar>
                      <ChartTooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-sm">
                                <div className="text-sm font-medium">{data.status}</div>
                                <div className="text-sm text-muted-foreground">
                                  Applications: {data.applications}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6 mb-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold" style={{ color: '#0b503c' }}>${Math.round(salesMetrics.totalSales).toLocaleString()}</div>
                  <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold" style={{ color: '#0b503c' }}>{salesMetrics.unsoldCount}</div>
                  <p className="text-sm text-gray-600 mt-1">Unsold Bales</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold" style={{ color: '#0b503c' }}>{containerMetrics.unshippedCount}</div>
                  <p className="text-sm text-gray-600 mt-1">Containers in Warehouse</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold" style={{ color: '#0b503c' }}>{containerMetrics.shippedCount}</div>
                  <p className="text-sm text-gray-600 mt-1">Containers Shipped</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              
              {/* Sales Overview */}
              <Card className="border-l-4 border-l-[#0b503c]">
                <CardHeader>
                  <CardTitle className="text-lg">Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-sm text-gray-700">Revenue</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>
                        ${Math.round(salesMetrics.totalSales).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-sm text-gray-700">Sold Weight</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>
                        {salesMetrics.totalWeight.toFixed(0)} kg
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-sm text-gray-700">Avg Price/kg</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>
                        ${salesMetrics.avgPricePerKg.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-sm text-gray-700">Bales Sold</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{salesMetrics.count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales by Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sales by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    revenue: {
                      label: "Revenue",
                      color: "#0b503c",
                    },
                    label: {
                      color: "var(--background)",
                    },
                  }} className="h-[200px]">
                    <BarChart
                      accessibilityLayer
                      data={salesMetrics.byQuality}
                      layout="vertical"
                      margin={{
                        right: 100,
                      }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="quality"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        hide
                      />
                      <XAxis dataKey="revenue" type="number" hide />
                      <ChartTooltip
                        cursor={false}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-1 gap-2">
                                  <div className="flex items-start gap-2">
                                    <div className="h-10 w-1 shrink-0 rounded-[2px] bg-[#0b503c]" />
                                    <div className="grid gap-1">
                                      <span className="text-sm font-semibold text-foreground">{label}</span>
                                      <span className="text-xs text-muted-foreground">Revenue: ${Number(payload[0].value).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        layout="vertical"
                        fill="#0b503c"
                        radius={4}
                      >
                        <LabelList
                          dataKey="quality"
                          position="right"
                          offset={8}
                          className="fill-foreground"
                          fontSize={11}
                          dy={-6}
                        />
                        <LabelList
                          dataKey="revenue"
                          position="right"
                          offset={8}
                          dy={6}
                          className="fill-muted-foreground"
                          fontSize={10}
                          formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Sales by Location - Horizontal Bar Chart */}
              <div className={`relative ${isLocationExpanded ? "row-span-2" : ""}`}>
                <Card className={`${isLocationExpanded ? "absolute z-10 flex flex-col" : "relative"}`} style={isLocationExpanded ? {
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0, // Stretch to fill available space
                } : {}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">Sales by Location</CardTitle>
                  {salesMetrics.totalSales > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Total sales: ${Math.round(salesMetrics.totalSales).toLocaleString()}
                    </div>
                  )}
                </CardHeader>
                <CardContent className={`pb-2 ${isLocationExpanded ? "flex-1 flex flex-col" : ""}`}>
                  <ChartContainer config={{
                    amount: {
                      label: "Revenue",
                      color: "#0b503c",
                    },
                    label: {
                      color: "var(--background)",
                    },
                  }} className={isLocationExpanded ? "flex-1" : "h-[200px]"}>
                    <BarChart
                      accessibilityLayer
                      data={salesMetrics.byLocation}
                      layout="vertical"
                      margin={{
                        right: 100,
                      }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="location"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 10)}
                        hide
                      />
                      <XAxis dataKey="amount" type="number" hide />
                      <ChartTooltip
                        cursor={false}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-1 gap-2">
                                  <div className="flex items-start gap-2">
                                    <div className="h-10 w-1 shrink-0 rounded-[2px] bg-[#0b503c]" />
                                    <div className="grid gap-1">
                                      <span className="text-sm font-semibold text-foreground">{label}</span>
                                      <span className="text-xs text-muted-foreground">Revenue: ${Number(payload[0].value).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="amount"
                        layout="vertical"
                        fill="#0b503c"
                        radius={4}
                        maxBarSize={40}
                      >
                        <LabelList
                          dataKey="location"
                          position="right"
                          offset={8}
                          className="fill-foreground"
                          fontSize={11}
                          dy={-6}
                        />
                        <LabelList
                          dataKey="amount"
                          position="right"
                          offset={8}
                          dy={6}
                          className="fill-muted-foreground"
                          fontSize={10}
                          formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
                <div className="flex justify-center pb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLocationExpanded(!isLocationExpanded)}
                    className="h-6 px-2 text-muted-foreground hover:text-foreground"
                  >
                    {isLocationExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </Card>
              </div>

              {/* Unsold Bales by Quality */}
              <Card className="border-l-4 border-l-[#0b503c]">
                <CardHeader>
                  <CardTitle className="text-lg">Unsold Bales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">In Warehouse</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{salesMetrics.warehouseCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">Shipped</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{salesMetrics.shippedCount}</span>
                    </div>
                  </div>
                  {salesMetrics.unsoldByQuality.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {salesMetrics.unsoldByQuality.map((item, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <span className="text-xs text-gray-700">{item.quality}</span>
                          <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400">No unsold inventory</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Container Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Containers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">Shipped</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{containerMetrics.shippedCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">In Warehouse</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{containerMetrics.unshippedCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">Avg Bales/Container</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{Math.round(containerMetrics.avgBalesPerContainer)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">Avg Weight/Container</span>
                      <span className="font-bold" style={{ color: '#0b503c' }}>{containerMetrics.avgWeightPerContainer.toFixed(0)} kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}

export default Reporting;