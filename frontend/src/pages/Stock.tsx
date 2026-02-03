import React, { useState, useEffect } from 'react';

interface Data {
    categoryName: string;
    subCategoryName: string;
    buyPrice: number;
    buyQuantity: number;
    sellPrice: number;
    sellQuantity: number;
    totalPrice: number;
    totalQuantity: number;
}

interface Categorys {
    categoryId: string;
    categoryName: string;
}

interface subCategorys {
    subCategoryId: string;
    subCategoryName: string;
}

const InventoryReport: React.FC = () => {
    const [data, setData] = useState<Data[]>([]);
    const [categorys, setCategorys] = useState<Categorys[]>([]);
    const [subCategorys, setSubCategorys] = useState<subCategorys[]>([]);
    const [loadingSubCategory, setLoadingSubCategory] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    // filter states
    const [date, setDate] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [subCategoryId, setSubCategoryId] = useState<string>('');
    const [orderId, setOrderId] = useState<string>('');
    const [grade, setGrade] = useState<string>('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');

    const handleSearch = () => {
        setCurrentPage(1);
        getData(itemsPerPage, 0, date, orderId, grade, minPrice, maxPrice, categoryId, subCategoryId);
    };

    // ฟังก์ชันรีเซ็ต
    const handleReset = () => {
        setDate('');
        setCategoryId('');
        setSubCategoryId('');
        setOrderId('');
        setGrade('');
        setMinPrice('');
        setMaxPrice('');
        setCurrentPage(1);
        getData(itemsPerPage, 0, '', '', '', '', '', '', '');
    };

    const totalPages = Math.ceil(totalRecords / itemsPerPage);
    const getData = async (
        limit: number,
        offset: number,
        date: string,
        orderId: string,
        grade: string,
        minPrice: string,
        maxPrice: string,
        categoryId: string,
        subCategoryId: string
    ) => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report?orderFinishedDate=${date}&categoryId=${categoryId}&subCategoryId=${subCategoryId}&orderId=${orderId}&maxPrice=${maxPrice}&minPrice=${minPrice}&grade=${grade}&limit=${limit}&offset=${offset}`);
            const result = await response.json();
            setData(result.data);
            setTotalRecords(result.res_total);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    const getCategorys = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/category`);
            const result = await response.json();
            setCategorys(result.res_result);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const getSubCategorys = async (categoryId: string) => {
        if (!categoryId) {
            setSubCategorys([]);
            return;
        }
        try {
            setLoadingSubCategory(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subcategory?categoryId=${categoryId}`);
            const result = await response.json();
            setSubCategorys(result.res_result);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoadingSubCategory(false);
        }
    };

    useEffect(() => {
        getCategorys();
        const offset = (currentPage - 1) * itemsPerPage;
        getData(itemsPerPage, offset, '', '', '', '', '', '', '');
    }, [currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="p-6 min-h-screen font-sans text-slate-900">
            <div className="w-full mx-auto max-w-7xl">
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
                            onChange={e => setDate(e.target.value)}
                            value={date}
                        />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">หมวดหมู่ (Category)</label>
                        <select
                            className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none bg-white max-w-full truncate"
                            onChange={e => {
                                const value = e.target.value;
                                setCategoryId(value);
                                setSubCategoryId('');
                                getSubCategorys(value);
                            }}
                            value={categoryId}
                        >
                            <option value="">ทั้งหมด</option>
                            {categorys.map((item) => (
                                <option key={item.categoryId} value={item.categoryId}>
                                    {item.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sub-category */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">หมวดหมู่ย่อย (Sub-category)</label>
                        <select
                            className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none bg-white disabled:bg-gray-50"
                            onChange={e => setSubCategoryId(e.target.value)}
                            value={subCategoryId}
                            disabled={!categoryId || loadingSubCategory}
                        >
                            <option value="">ทั้งหมด</option>
                            {subCategorys.map((item) => (
                                <option key={item.subCategoryId} value={item.subCategoryId}>
                                    {item.subCategoryName}
                                </option>
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
                            onChange={e => setOrderId(e.target.value)}
                            value={orderId}
                        />
                    </div>

                    {/* Grade */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">เกรด (Grade)</label>
                        <select
                            className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none bg-white"
                            onChange={e => setGrade(e.target.value)}
                            value={grade}
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
                                onChange={e => setMinPrice(e.target.value)}
                                value={minPrice}
                            />
                            <input
                                type="number"
                                placeholder="ราคาสุดท้าย"
                                className="border p-2 rounded-lg w-full text-sm h-[40px] outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={e => setMaxPrice(e.target.value)}
                                value={maxPrice}
                            />
                        </div>
                    </div>

                    {/* Search and Reset Buttons */}
                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleSearch}
                            className="flex-1 h-[40px] bg-blue-600 hover:bg-blue-700 text-[#4534f0] font-bold rounded-lg text-sm transition-colors"
                        >
                            ค้นหา
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex-1 h-[40px] bg-slate-100 hover:bg-slate-200 text-[#4534f0] font-bold rounded-lg text-sm transition-colors"
                        >
                            รีเซ็ต
                        </button>
                    </div>
                </div>


                {/* --- TABLE --- */}
                {loading ? (
                    <div className="p-10 text-center font-bold">กำลังโหลดข้อมูล...</div>
                ) : data.length === 0 ? (
                    <div className="p-10 text-center font-bold">ไม่มีข้อมูลที่จะแสดง</div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                            <div className="overflow-x-auto">

                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700 text-base font-bold">
                                            <th className=" p-4 text-left w-64 uppercase tracking-wider">สินค้า</th>
                                            <th className=" p-4 text-right uppercase tracking-wider">จำนวนซื้อ (กก.)</th>
                                            <th className=" p-4 text-right uppercase tracking-wider">รวมซื้อ (บาท)</th>
                                            <th className=" p-4 text-right uppercase tracking-wider">จำนวนขาย (กก.)</th>
                                            <th className=" p-4 text-right uppercase tracking-wider">รวมขาย (บาท)</th>
                                            <th className=" p-4 text-right  uppercase tracking-wider">คงเหลือ (กก.)</th>
                                            <th className=" p-4 text-right uppercase tracking-wider">จำนวนเงินคงเหลือ (บาท)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.map((item: Data, index: number) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="p-4 text-left whitespace-nowrap">
                                                    <div className="font-semibold text-slate-800">
                                                        {item.categoryName}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {item.subCategoryName}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right whitespace-nowrap text-slate-700">
                                                    {item.buyQuantity.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-right whitespace-nowrap text-slate-700">
                                                    {item.buyPrice.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-right whitespace-nowrap text-slate-700">
                                                    {item.sellQuantity.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-right whitespace-nowrap text-slate-700">
                                                    {item.sellPrice.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-right whitespace-nowrap text-[#4534f0] font-semibold">
                                                    {item.totalQuantity.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-right whitespace-nowrap text-[#b42996] font-semibold">
                                                    {item.totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* --- PAGINATION --- */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-slate-600">
                                        แสดง {((currentPage - 1) * itemsPerPage) + 1} ถึง {Math.min(currentPage * itemsPerPage, totalRecords)} จาก {totalRecords} รายการ
                                    </span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                        className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={10}>10 / หน้า</option>
                                        <option value={25}>25 / หน้า</option>
                                        <option value={50}>50 / หน้า</option>
                                        <option value={100}>100 / หน้า</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                                    >
                                        หน้าแรก
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                                    >
                                        ก่อนหน้า
                                    </button>

                                    {getPageNumbers().map((page, index) => (
                                        typeof page === 'number' ? (
                                            <button
                                                key={index}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === page
                                                    ? 'bg-blue-600 text-[#4534f0]'
                                                    : 'border border-slate-300 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ) : (
                                            <span key={index} className="px-2 text-slate-400">
                                                {page}
                                            </span>
                                        )
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                                    >
                                        ถัดไป
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                                    >
                                        หน้าสุดท้าย
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default InventoryReport;