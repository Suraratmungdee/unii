import React, { useState, useEffect, useMemo } from 'react';

// --- Interfaces ---
interface GradeItem {
  grade: string;
  price: number;
  quantity: string | number;
  total: number;
}

interface RequestItem {
  categoryID: string;
  subCategoryID: string;
  requestList: GradeItem[];
}

interface Order {
  orderId: string;
  orderFinishedDate: string;
  requestList: RequestItem[];
  tType: 'BUY' | 'SELL';
}

interface SubCategory {
  subCategoryId: string;
  subCategoryName: string;
}

interface Product {
  categoryId: string;
  categoryName: string;
  subcategory: SubCategory[];
}

interface Filters {
  date: string;
  orderId: string;
  grade: string;
  minPrice: string;
  maxPrice: string;
  categoryId: string;    
  subCategoryId: string;
}

interface SummaryItem {
  catId: string;
  subCatId: string;
  catName: string;
  subCatName: string;
  buyQty: number;
  buyAmt: number;
  sellQty: number;
  sellAmt: number;
}

const InventoryReport: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<Filters>({
    date: '',
    orderId: '',
    grade: '',
    minPrice: '',
    maxPrice: '',
    categoryId: '',
    subCategoryId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, productRes] = await Promise.all([
          fetch('https://apirecycle.unii.co.th/Stock/query-transaction-demo'),
          fetch('https://apirecycle.unii.co.th/category/query-product-demo')
        ]);
        const orderData = await orderRes.json();
        const productData = await productRes.json();

        const combined: Order[] = [
          ...(orderData.buyTransaction || []).map((o: any) => ({ ...o, tType: 'BUY' })),
          ...(orderData.sellTransaction || []).map((o: any) => ({ ...o, tType: 'SELL' }))
        ];

        setOrders(combined);
        setProducts(productData.productList || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // แมพไอดีเป็นชื่อหมวดหมู่และหมวดหมู่ย่อย
  const { categoryMap, subCategoryMap } = useMemo(() => {
    const catMap: Record<string, string> = {};
    const subMap: Record<string, string> = {};

    if (Array.isArray(products)) {
      products.forEach(cat => {
        catMap[String(cat.categoryId)] = cat.categoryName;
        if (cat.subcategory) {
          cat.subcategory.forEach(sub => {
            subMap[String(sub.subCategoryId)] = sub.subCategoryName;
          });
        }
      });
    }
    return { categoryMap: catMap, subCategoryMap: subMap };
  }, [products]);

  // ตัวเลือกหมวดหมู่ย่อยตามหมวดหมู่ที่เลือก
  const availableSubCategories = useMemo(() => {
    if (!filters.categoryId) return [];
    const selectedCat = products.find(p => String(p.categoryId) === filters.categoryId);
    return selectedCat ? selectedCat.subcategory : [];
  }, [filters.categoryId, products]);

  // ประมวลผลข้อมูลตามฟิลเตอร์
  const processedData = useMemo(() => {
    const summary: Record<string, SummaryItem> = {};

    orders.forEach(order => {
      if (filters.date && order.orderFinishedDate !== filters.date) return;
      if (filters.orderId && !order.orderId.includes(filters.orderId)) return;

      order.requestList.forEach(itemGroup => {
        
        if (filters.categoryId && itemGroup.categoryID !== filters.categoryId) return;
        if (filters.subCategoryId && itemGroup.subCategoryID !== filters.subCategoryId) return;

        const targetGrades = itemGroup.requestList.filter(g =>
          (!filters.grade || g.grade === filters.grade) && Number(g.quantity) > 0
        );

        const qty = targetGrades.reduce((sum, g) => sum + Number(g.quantity), 0);
        const amt = targetGrades.reduce((sum, g) => sum + g.total, 0);

        if (filters.minPrice && amt < Number(filters.minPrice)) return;
        if (filters.maxPrice && amt > Number(filters.maxPrice)) return;

        if (qty > 0) {
          const key = `${itemGroup.categoryID}-${itemGroup.subCategoryID}`;

          if (!summary[key]) {
            summary[key] = {
              catId: itemGroup.categoryID,
              subCatId: itemGroup.subCategoryID,
              catName: categoryMap[itemGroup.categoryID] || "ไม่ระบุหมวด",
              subCatName: subCategoryMap[itemGroup.subCategoryID] || "ไม่ระบุชนิด",
              buyQty: 0, buyAmt: 0, sellQty: 0, sellAmt: 0
            };
          }

          if (order.tType === 'BUY') {
            summary[key].buyQty += qty;
            summary[key].buyAmt += amt;
          } else {
            summary[key].sellQty += qty;
            summary[key].sellAmt += amt;
          }
        }
      });
    });

    return Object.values(summary);
  }, [orders, filters, categoryMap, subCategoryMap]);

  if (loading) return <div className="p-10 text-center font-bold">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-6 min-h-screen font-sans text-slate-900">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-black mb-8 text-slate-800 uppercase tracking-tight">
          Report
        </h1>

        {/* --- FILTER PANEL --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">วันที่ (Date)</label>
            <input
              type="date"
              className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setFilters({ ...filters, date: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">หมวดหมู่ (Category)</label>
            <select
              className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none bg-white"
              value={filters.categoryId}
              onChange={e => setFilters({ ...filters, categoryId: e.target.value, subCategoryId: '' })}
            >
              <option value="">ทั้งหมด</option>
              {products.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
              ))}
            </select>
          </div>

          {/* Sub-category */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">หมวดหมู่ย่อย (Sub-category)</label>
            <select
              className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none bg-white disabled:bg-gray-50"
              value={filters.subCategoryId}
              disabled={!filters.categoryId}
              onChange={e => setFilters({ ...filters, subCategoryId: e.target.value })}
            >
              <option value="">ทั้งหมด</option>
              {availableSubCategories.map(sub => (
                <option key={sub.subCategoryId} value={sub.subCategoryId}>{sub.subCategoryName}</option>
              ))}
            </select>
          </div>

          {/* Order ID */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">เลขคำสั่งซื้อ (Order ID)</label>
            <input
              type="text"
              placeholder="ค้นหา ID..."
              className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setFilters({ ...filters, orderId: e.target.value })}
            />
          </div>

          {/* Grade */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">เกรด (Grade)</label>
            <select
              className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none bg-white"
              onChange={e => setFilters({ ...filters, grade: e.target.value })}
            >
              <option value="">ทั้งหมด</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase">ช่วงราคา (Price Range)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="ราคาเริ่มต้น"
                className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="ราคาสุดท้าย"
                className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ date: '', orderId: '', grade: '', minPrice: '', maxPrice: '', categoryId: '', subCategoryId: '' })}
              className="w-full h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-sm transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-base font-bold">
                  <th className=" p-3 text-left w-64 uppercase tracking-wider">สินค้า</th>
                  <th className=" p-3 text-right uppercase tracking-wider">จำนวนซื้อ (กก.)</th>
                  <th className=" p-3 text-right uppercase tracking-wider">รวมซื้อ (บาท)</th>
                  <th className=" p-3 text-right uppercase tracking-wider">จำนวนขาย (กก.)</th>
                  <th className=" p-3 text-right uppercase tracking-wider">รวมขาย (บาท)</th>
                  <th className=" p-3 text-right  uppercase tracking-wider">คงเหลือ (กก.)</th>
                  <th className=" p-3 text-right uppercase tracking-wider">จำนวนเงินคงเหลือ (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedData.length > 0 ? processedData.map((item, idx) => (
                  <tr key={`${item.catId}-${item.subCatId}-${idx}`} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-700 leading-tight">{item.catName} <span className="text-[10px] text-slate-400">({item.catId})</span></div>
                      <div className="text-blue-500 text-[11px] font-semibold uppercase mt-1">{item.subCatName} <span className="text-[10px] text-slate-300">({item.subCatId})</span></div>
                    </td>
                    <td className="p-4 text-right font-mono text-sm">{item.buyQty.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right font-mono text-sm">{item.buyAmt.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono text-sm">{item.sellQty.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right font-mono text-sm">{item.sellAmt.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-blue-700 bg-blue-50/50">
                      {(item.buyQty - item.sellQty).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-700 bg-emerald-50/50">
                      {(item.buyAmt - item.sellAmt).toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-20 text-center text-slate-400 italic">
                      ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;