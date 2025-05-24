'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import axios from 'axios';
import Link from 'next/link';

export default function DetailedIncomeBreakdown() {
  const router = useRouter();
  const [breakdownData, setBreakdownData] = useState({});
  const [loading, setLoading] = useState(true);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const { dateRange } = useAppSelector(state => state.reportSlice);
  const [activeTab, setActiveTab] = useState('rateCard'); // 'rateCard' or 'paymentMode'

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    fetchBreakdownData();
  }, [dateRange.startDate, dateRange.endDate]);

  const fetchBreakdownData = async () => {
    try {
      const response = await axios.get(
        `https://orders.baleenmedia.com/API/Media/OrdersList.php?JsonDBName=${companyName}&JsonStartDate=${dateRange.startDate}&JsonEndDate=${dateRange.endDate}`
      );

      const validOrders = response.data.filter(order => order.RateWiseOrderNumber > 0);
      processOrderData(validOrders);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processOrderData = (orders) => {
    const data = {
      byRateCard: {},
      byPaymentMode: {}
    };

    orders.forEach(order => {
      const rateName = order.Card;
      
      // Parse payment modes and amounts from the PaymentMode string
      // Format is "Mode1: Amount1, Mode2: Amount2"
      const paymentPairs = order.PaymentMode?.split(',').map(pair => pair.trim()) || ['No Payments: 0'];
      const paymentModes = paymentPairs.map(pair => pair.split(':')[0].trim());
      const paymentAmounts = paymentPairs.map(pair => {
        const amount = pair.split(':')[1];
        return parseFloat(amount?.trim() || '0');
      });
      
      // Safely parse numeric values with support for negative numbers
      const parseAmount = (value) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          // First trim and remove currency symbols and spaces
          const cleanValue = value.trim().replace(/[₹\s]/g, '');
          // Now parse as float (this will handle negative signs correctly)
          return parseFloat(cleanValue) || 0;
        }
        return 0;
      };
      
      // Calculate order value including adjustments
      const baseOrderValue = parseAmount(order.Receivable);
      const adjustment = parseAmount(order.AdjustedOrderAmount); // This will now preserve negative signs
      const orderValue = baseOrderValue + adjustment;
      const income = parseAmount(order.TotalAmountReceived);

      // Create payment splits object with the actual amounts
      const paymentSplits = {};
      paymentModes.forEach((mode, index) => {
        paymentSplits[mode] = paymentAmounts[index] || 0;
      });

      // Process by Rate Card
      if (!data.byRateCard[rateName]) {
        data.byRateCard[rateName] = {
          totalOrders: 0,
          totalOrderValue: 0,
          totalIncome: 0,
          distinctIncomes: {},
          paymentModes: {}
        };
      }
      data.byRateCard[rateName].totalOrders++;
      data.byRateCard[rateName].totalOrderValue += orderValue;
      data.byRateCard[rateName].totalIncome += income;      // Track distinct incomes for rate card
      if (!data.byRateCard[rateName].distinctIncomes[income]) {
        data.byRateCard[rateName].distinctIncomes[income] = {
          count: 0,
          total: 0,
          orders: [],
          paymentModeDistribution: {}
        };
      }
      data.byRateCard[rateName].distinctIncomes[income].count++;
      data.byRateCard[rateName].distinctIncomes[income].total += income;
      
      // Track payment mode distribution for this income amount
      paymentModes.forEach((mode) => {
        if (!data.byRateCard[rateName].distinctIncomes[income].paymentModeDistribution[mode]) {
          data.byRateCard[rateName].distinctIncomes[income].paymentModeDistribution[mode] = 0;
        }
        data.byRateCard[rateName].distinctIncomes[income].paymentModeDistribution[mode] += paymentSplits[mode];
      });
      
      // Add order details for rate card view
      data.byRateCard[rateName].distinctIncomes[income].orders.push({
        rateWiseOrderNumber: order.RateWiseOrderNumber,
        rateCard: order.Card,
        type: order.AdType || 'N/A',
        orderValue: orderValue,
        amount: income,
        paymentModes: paymentModes.map((mode, index) => ({
          mode,
          amount: paymentSplits[mode]
        })).filter(p => p.amount > 0)
      });

      // Process by Payment Mode
      paymentModes.forEach((mode, modeIndex) => {
        if (!data.byPaymentMode[mode]) {
          data.byPaymentMode[mode] = {
            totalOrders: 0,
            totalOrderValue: 0,
            totalIncome: 0,
            distinctIncomes: {},
            rateCards: {}
          };
        }

        const modeAmount = paymentSplits[mode];
        data.byPaymentMode[mode].totalOrders++;
        data.byPaymentMode[mode].totalOrderValue += orderValue;
        data.byPaymentMode[mode].totalIncome += modeAmount;

        // Track distinct incomes for payment mode
        if (!data.byPaymentMode[mode].distinctIncomes[modeAmount]) {
          data.byPaymentMode[mode].distinctIncomes[modeAmount] = {
            count: 0,
            total: 0,
            orders: []
          };
        }
        
        const incomeGroup = data.byPaymentMode[mode].distinctIncomes[modeAmount];
        incomeGroup.count++;
        incomeGroup.total += modeAmount;

        // Create order info with split payment details
        const otherPayments = paymentModes
          .map((otherMode, otherIndex) => {
            if (otherMode !== mode) {
              return {
                mode: otherMode,
                amount: paymentSplits[otherMode]
              };
            }
            return null;
          })
          .filter(Boolean);

        incomeGroup.orders.push({
          rateWiseOrderNumber: order.RateWiseOrderNumber,
          rateCard: order.Card,
          type: order.AdType || 'N/A',
          amount: modeAmount,
          otherPayments
        });
      });
    });

    setBreakdownData(data);
  };

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  const renderTileContent = (title, data) => (
    <div key={title} className="bg-white rounded-lg shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-md transition-all duration-200">
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4">
        <div>
          <p className="text-xs sm:text-sm md:text-base text-gray-500">Total Orders</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{data.totalOrders}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm md:text-base text-gray-500">Total Income</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{formatCurrency(data.totalIncome)}</p>
        </div>
      </div>
      <div className="mt-3 sm:mt-4 border-t pt-3 sm:pt-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h4 className="text-xs sm:text-sm md:text-base font-medium text-gray-700">Order Value</h4>
          <span className="text-base sm:text-lg md:text-xl font-semibold text-blue-600">{formatCurrency(data.totalOrderValue)}</span>
        </div>      </div><details className="mt-4 md:mt-6 group">
        <summary className="cursor-pointer text-xs sm:text-sm md:text-base font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 select-none">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-open:rotate-180 transition-transform duration-300 ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Income Distribution
        </summary>
        <div className="mt-3 md:mt-4 space-y-2 md:space-y-3 max-h-[24rem] sm:max-h-[28rem] md:max-h-[32rem] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent transition-all duration-300 ease-in-out origin-top">
          {Object.entries(data.distinctIncomes)
            .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
            .map(([value, info]) => (
              <div key={value} className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:border-blue-100 transition-all">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 mb-2">
                  <span className="text-base sm:text-lg md:text-xl font-semibold text-green-600">{formatCurrency(parseFloat(value))}</span>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <span className="text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border border-gray-100">
                      {info.count} orders
                    </span>
                    <span className="font-medium text-green-600 text-xs sm:text-sm">
                      Total: {formatCurrency(info.total)}
                    </span>
                  </div>
                </div>
                {activeTab === 'rateCard' && info.paymentModeDistribution && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-2">Payment Mode Distribution</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(info.paymentModeDistribution)
                        .filter(([_, amount]) => amount > 0)
                        .map(([mode, amount]) => (
                          <div key={mode} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                            <span className="text-xs font-medium text-gray-700">{mode}</span>
                            <span className="text-xs text-emerald-600 font-medium">
                              ₹{amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {activeTab === 'paymentMode' && info.orders && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                    <div className="space-y-2">
                      {info.orders.map((order, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <div className="grid grid-cols-2">
                            {/* Left side */}
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700">
                                R.Order #{order.rateWiseOrderNumber}
                              </div>
                              {order.otherPayments?.some(p => p.amount > 0) && (
                                <div className="text-xs text-gray-500">
                                  {order.otherPayments
                                    .filter(p => p.amount > 0)
                                    .map((p, i) => (
                                      <div key={i} className="flex items-center gap-1">
                                        <span>{p.mode}:</span>
                                        <span className="text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</span>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>

                            {/* Right side */}
                            <div className="text-right space-y-1">
                              <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                                {order.rateCard}
                              </div>
                              {order.type !== 'N/A' && (
                                <div className="text-xs text-gray-600">{order.type}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </details>
    </div>
  );
  const IncomeDistribution = ({ distinctIncomes }) => {
    return (
      <div className="space-y-4 mt-4">
        {Object.entries(distinctIncomes).map(([amount, data]) => (
          <div key={amount} className="space-y-2">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium text-emerald-600">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
                <span className="text-sm text-gray-500">{data.count} orders</span>
              </div>
              <div className="text-sm text-emerald-600 font-medium">
                Total: ₹{data.total.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="grid gap-4">
              {data.orders?.map((order, index) => (
                <div key={`${order.rateWiseOrderNumber}-${index}`} 
                     className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all">
                  <div className="flex flex-col space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-600">R.Order #{order.rateWiseOrderNumber}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {order.rateCard}
                          </span>
                          {order.type !== 'N/A' && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                              {order.type}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-emerald-600">
                        ₹{order.amount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Other Payments */}
                    {order.otherPayments?.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="text-xs font-medium text-gray-500 mb-2">Other Payments</div>
                        <div className="flex flex-wrap gap-2">
                          {order.otherPayments.map((payment, idx) => (
                            payment.amount > 0 && (
                              <div key={idx} 
                                   className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                                <span className="text-xs font-medium text-gray-700">{payment.mode}</span>
                                <span className="text-xs text-emerald-600 font-medium">
                                  ₹{payment.amount.toLocaleString('en-IN')}
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 sm:border-b-3 border-blue-500"></div>
      </div>
    );
  }
  return (
    <main className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header and Navigation */}        
        <div className="mb-6">          
          <Link 
            href="/Report"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reports
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-2xl font-bold text-blue-600">Detailed Income Breakdown</h1>
            
            {/* Date Range Display - Below title on mobile, right-aligned on desktop */}
            <div className="text-sm text-gray-600 mt-2 md:mt-0">
              {dateRange.startDate && dateRange.endDate && (
                <p>
                  {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                </p>
              )}
            </div>
          </div>

          <div className="flex mt-4 border-b">
            <button
              onClick={() => setActiveTab('rateCard')}
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rateCard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Rate Card View
            </button>
            <button
              onClick={() => setActiveTab('paymentMode')}
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'paymentMode'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Payment Mode View
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === 'rateCard' 
            ? Object.entries(breakdownData.byRateCard || {}).map(([rateName, data]) => 
                renderTileContent(rateName, data)
              )
            : Object.entries(breakdownData.byPaymentMode || {}).map(([mode, data]) => 
                renderTileContent(mode, data)
              )}
        </div>
      </div>
    </main>
  );
}
