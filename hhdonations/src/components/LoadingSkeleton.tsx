import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingSkeletonProps {
  type?: 'dashboard' | 'findbin' | 'table' | 'form' | 'sidebar';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'dashboard' }) => {
  if (type === 'sidebar') {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Skeleton className="w-24 h-24 ml-4" />
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 px-4 py-3">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-4 py-3">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'findbin') {
    return (
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="px-8 pt-10 pb-6">
          <Skeleton className="h-9 w-64" />
        </div>

        {/* Main Content Area - Full Height */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-8 pb-6 overflow-hidden">
          {/* Map with Search Bar */}
          <div className="lg:col-span-2 h-full flex flex-col gap-4">
            {/* Search Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
            
            {/* Map */}
            <Card className="flex-1">
              <CardContent className="p-0 h-full">
                <Skeleton className="w-full h-full min-h-[400px]" />
              </CardContent>
            </Card>
          </div>

          {/* Nearby Bins List */}
          <div className="lg:col-span-1 h-full overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 px-4 pb-6">
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Skeleton className="h-5 w-36 mb-2" />
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="p-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="grid grid-cols-8 gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              
              {/* Table Rows */}
              <div className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="grid grid-cols-8 gap-4 items-center">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default dashboard skeleton
  return (
    <div className="flex-1 ml-64 p-6">
      <div className="mb-6">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart Section */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingSkeleton;