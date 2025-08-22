'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { publicBrandAPI } from '@/lib/api';
import { BrandCategory } from '@/types';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const COLORS = [
  '#3B82F6', // 블루
  '#EF4444', // 레드
  '#10B981', // 그린
  '#F59E0B', // 앰버
  '#8B5CF6', // 바이올렛
  '#EC4899', // 핑크
  '#06B6D4', // 시안
  '#84CC16', // 라임
];

const CATEGORY_ICONS: { [key: string]: string } = {
  '외식': '🍽️',
  '뷰티': '💄',
  '교육': '📚',
  '편의점': '🏪',
  '기타': '🏠'
};

export default function BrandCategoryChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [totalBrands, setTotalBrands] = useState(0);

  // 카테고리별 브랜드 통계 데이터 가져오기
  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      const response = await publicBrandAPI.getCategories();
      
      if (response.data.success) {
        const categories: BrandCategory[] = response.data.data;
        
        // 차트 데이터 변환
        const data: ChartData[] = categories.map((category, index) => ({
          name: category.categoryName,
          value: category.brandCount || 0,
          color: COLORS[index % COLORS.length]
        }));
        
        // 전체 브랜드 수 계산
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        setChartData(data);
        setTotalBrands(total);
        setError(null);
      } else {
        throw new Error(response.data.message || '카테고리 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('카테고리 통계 조회 실패:', err);
      setError('카테고리 통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  // 파이 차트 커스텀 라벨
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // 5% 미만은 라벨 숨김
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // 툴팁 커스텀
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalBrands > 0 ? ((data.value / totalBrands) * 100).toFixed(1) : '0';
      
      return (
        <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{CATEGORY_ICONS[data.name] || '🏠'}</span>
            <p className="text-white font-medium">{data.name}</p>
          </div>
          <p className="text-blue-400">
            브랜드 수: <span className="font-bold">{data.value}개</span>
          </p>
          <p className="text-gray-300">
            비율: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">차트 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchCategoryStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/30 shadow-xl rounded-lg p-6 mb-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">카테고리별 브랜드 통계</h2>
          <p className="text-gray-300 text-sm mt-1">전체 {totalBrands}개 브랜드</p>
        </div>
        
        {/* 차트 타입 선택 */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setChartType('pie')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              chartType === 'pie'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            파이 차트
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            막대 차트
          </button>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 차트 */}
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                  stroke="#6B7280"
                />
                <YAxis 
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                  stroke="#6B7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* 범례 및 상세 정보 */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white mb-4">카테고리별 상세</h3>
          {chartData.map((item, index) => {
            const percentage = totalBrands > 0 ? ((item.value / totalBrands) * 100).toFixed(1) : '0';
            return (
              <div 
                key={item.name}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{CATEGORY_ICONS[item.name] || '🏠'}</span>
                    <span className="text-white font-medium">{item.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{item.value}개</div>
                  <div className="text-gray-400 text-sm">{percentage}%</div>
                </div>
              </div>
            );
          })}
          
          {/* 요약 통계 */}
          {chartData.length > 0 && (
            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700/30 rounded-lg">
              <h4 className="text-white font-medium mb-3">요약</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>가장 많은 카테고리:</span>
                  <span className="text-white font-medium">
                    {chartData.reduce((max, item) => item.value > max.value ? item : max).name}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>카테고리 수:</span>
                  <span className="text-white font-medium">{chartData.length}개</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>평균 브랜드 수:</span>
                  <span className="text-white font-medium">
                    {chartData.length > 0 ? Math.round(totalBrands / chartData.length) : 0}개
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
