import { useState, useEffect } from 'react';
import { itemsService } from '../services/itemsService';
import { customersService } from '../services/customersService';
import { salesService } from '../services/salesService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCustomers: 0,
    totalSales: 0,
    revenue: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [itemsRes, customersRes, salesRes] = await Promise.all([
        itemsService.getAll(),
        customersService.getAll(),
        salesService.getAll()
      ]);

      const items = itemsRes.data?.items || itemsRes.data?.data?.items || itemsRes.data || [];
      const customers = customersRes.data?.customers || customersRes.data?.data?.customers || customersRes.data || [];
      const sales = salesRes.data?.sales || salesRes.data?.data?.sales || salesRes.data || [];

      const lowStock = items.filter(item => item.quantity < 10);
      
      const revenue = sales.reduce((sum, sale) => {
        const item = items.find(i => i._id === sale.itemId);
        return sum + (item ? item.price * sale.quantity : 0);
      }, 0);

      setStats({
        totalItems: items.length,
        totalCustomers: customers.length,
        totalSales: sales.length,
        revenue: revenue
      });

      setLowStockItems(lowStock.slice(0, 5));
      setRecentSales(sales.slice(-5).reverse());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalSales}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{stats.revenue.toFixed(2)}</p>
            </div>
            <div className="text-4xl">💵</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Low Stock Items</h2>
          {lowStockItems.length === 0 ? (
            <p className="text-gray-500">No items with low stock</p>
          ) : (
            <ul className="space-y-2">
              {lowStockItems.map((item) => (
                <li key={item._id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-red-600 font-semibold">Qty: {item.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
          {recentSales.length === 0 ? (
            <p className="text-gray-500">No recent sales</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSales.map((sale) => (
                    <tr key={sale._id}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{sale.itemId}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{sale.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

