import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { PackageCheck, Truck, ClipboardList, LogOut, Layers, PackagePlus, FileText, Printer, Search, Bell, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('queues');
  const [loadingRole, setLoadingRole] = useState(true);

  // Automatically inject Tailwind CSS CDN so styling never fails to render
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setLoadingRole(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setLoadingRole(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (authId) => {
    setLoadingRole(true);
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', authId)
      .single();

    if (!error && data) {
      setUserRole(data.role);
      if (data.role === 'Warehouse Manager' || data.role === 'Manager') {
        setActiveTab('queues');
      } else if (data.role === 'Site Engineer' || data.role === 'Site Requester') {
        setActiveTab('requisitions');
      } else {
        setActiveTab('receiving');
      }
    }
    setLoadingRole(false);
  };

  if (!session) {
    return <LoginView />;
  }

  if (loadingRole) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-400 text-xs font-medium">
        Loading workspace...
      </div>
    );
  }

  const isManagerRole = userRole === 'Warehouse Manager' || userRole === 'Manager';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800 antialiased p-4 sm:p-6">
      {/* Main SaaS Frame Container */}
      <div className="w-full max-w-[1440px] mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 flex flex-col md:flex-row overflow-hidden min-h-[92vh]">
        
        {/* Left Clean Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 shrink-0 select-none">
          <div>
            {/* Brand Header */}
            <div className="flex items-center space-x-3 mb-10 px-2">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                IM
              </div>
              <div>
                <h1 className="text-slate-900 font-bold text-xs tracking-tight leading-tight">Inventory</h1>
                <h2 className="text-slate-900 font-bold text-xs tracking-tight leading-tight">Management</h2>
              </div>
            </div>

            {/* Navigation Menu */}
            {/* Navigation Menu */}
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('queues')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeTab === 'queues' ? 'bg-indigo-50 text-indigo-600 shadow-2xs' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Pending Queues</span>
              </button>

              {isManagerRole && (
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    activeTab === 'reports' ? 'bg-indigo-50 text-indigo-600 shadow-2xs' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Executive Reports</span>
                </button>
              )}

              {/* Goods Receiving & Product Catalog: Hidden for Site Engineers, Requesters, and Managers */}
              {!isManagerRole && userRole !== 'Site Engineer' && userRole !== 'Site Requester' && (
                <>
                  <button
                    onClick={() => setActiveTab('receiving')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                      activeTab === 'receiving' ? 'bg-indigo-50 text-indigo-600 shadow-2xs' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <PackageCheck className="h-4 w-4" />
                    <span>Goods Receiving</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                      activeTab === 'products' ? 'bg-indigo-50 text-indigo-600 shadow-2xs' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <PackagePlus className="h-4 w-4" />
                    <span>Product Catalog</span>
                  </button>
                </>
              )}

              {/* Site Requisitions: Hidden for Warehouse Workers */}
              {userRole !== 'Warehouse Worker' && (
                <button
                  onClick={() => setActiveTab('requisitions')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    activeTab === 'requisitions' ? 'bg-indigo-50 text-indigo-600 shadow-2xs' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Site Requisitions</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Profile Widget */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs border border-indigo-100">
                {userRole ? userRole.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">Operator</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{userRole || 'User'}</p>
              </div>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()}
              title="Sign Out"
              className="text-slate-400 hover:text-red-500 transition p-2 rounded-xl hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* Right Dynamic Canvas Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FBFBFC]">
          {/* Top Bar Header */}
          <header className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
            <div className="relative w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 transition">
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                <Bell className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-600">
                  {userRole ? userRole[0] : 'U'}
                </div>
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">{userRole || 'User'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </header>

          {/* Module View Content Area */}
          <div className="p-8 overflow-y-auto flex-1">
            {activeTab === 'receiving' && !isManagerRole && <ReceivingModule session={session} />}
            {activeTab === 'products' && !isManagerRole && <ProductCatalogModule />}
            {activeTab === 'queues' && <PendingQueuesModule session={session} userRole={userRole} />}
            {activeTab === 'reports' && isManagerRole && <ReportsModule session={session} />}
            {activeTab === 'requisitions' && <RequisitionModule session={session} userRole={userRole} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-VIEWS / MODULES ---

function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 space-y-6 border border-slate-200/80">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20 mb-4">
            IM
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Login</h2>
          <p className="text-xs text-slate-500 mt-1">Authenticate to access warehouse and inventory control workflows.</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl text-xs font-semibold border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium" 
              placeholder="operator@site.com"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium" 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition text-xs shadow-md shadow-indigo-500/20"
          >
            {loading ? 'Authenticating Secure Session...' : 'Sign In to Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductCatalogModule() {
  const [productForm, setProductForm] = useState({
    productName: '',
    category: 'Surveillance',
    subCategory: '',
    mpn: '',
    hsCode: '',
    trackSerialNumber: false,
    dimensions: '',
    grossWeight: ''
  });
  const [autoSku, setAutoSku] = useState('SKU-SUR-8492');
  const [submitting, setSubmitting] = useState(false);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setProductForm({ ...productForm, category });
    
    const prefix = category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setAutoSku(`SKU-${prefix}-${randomNum}`);
  };

  useEffect(() => {
    const prefix = productForm.category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setAutoSku(`SKU-${prefix}-${randomNum}`);
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('products').insert({
        sku: autoSku,
        product_name: productForm.productName,
        category: productForm.category,
        sub_category: productForm.subCategory,
        mpn: productForm.mpn || null,
        hs_code: productForm.hsCode || null,
        track_serial_number: productForm.trackSerialNumber,
        dimensions: productForm.dimensions || null,
        gross_weight: productForm.grossWeight ? parseFloat(productForm.grossWeight) : null
      });

      if (error) throw error;
      alert(`Product registered successfully with Auto SKU: ${autoSku}`);
      
      setProductForm({
        productName: '',
        category: 'Surveillance',
        subCategory: '',
        mpn: '',
        hsCode: '',
        trackSerialNumber: false,
        dimensions: '',
        grossWeight: ''
      });
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setAutoSku(`SKU-SUR-${randomNum}`);
    } catch (err) {
      alert(`Error saving product: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Product Master Catalog</h2>
        <p className="text-xs text-slate-500 mt-1">Register new items with auto-generated identification codes and compliance tracking flags.</p>
      </div>

      <form onSubmit={handleProductSubmit} className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Auto-Generated SKU Code</label>
            <input 
              type="text" 
              disabled
              value={autoSku}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-700 font-mono font-bold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Category <span className="text-red-500">*</span></label>
            <select 
              value={productForm.category}
              onChange={handleCategoryChange}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="Surveillance">Surveillance</option>
              <option value="Access Control">Access Control</option>
              <option value="Digital Display">Digital Display</option>
              <option value="Networking">Networking</option>
              <option value="Power Infrastructure">Power Infrastructure</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Product Name & Description <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              value={productForm.productName}
              onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
              placeholder="e.g., 4MP IP Dome Security Camera" 
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Manufacturer Part Number (MPN)</label>
            <input 
              type="text" 
              value={productForm.mpn}
              onChange={(e) => setProductForm({ ...productForm, mpn: e.target.value })}
              placeholder="e.g., OEM-DS-901" 
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">HS Code (Customs)</label>
            <input 
              type="text" 
              value={productForm.hsCode}
              onChange={(e) => setProductForm({ ...productForm, hsCode: e.target.value })}
              placeholder="e.g., 8525.89.00" 
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Dimensions & Gross Weight</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={productForm.dimensions}
                onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                placeholder="L x W x H (cm)" 
                className="w-1/2 border border-slate-200 rounded-2xl px-3.5 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
              <input 
                type="number" 
                step="0.01"
                value={productForm.grossWeight}
                onChange={(e) => setProductForm({ ...productForm, grossWeight: e.target.value })}
                placeholder="Weight (kg)" 
                className="w-1/2 border border-slate-200 rounded-2xl px-3.5 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
          <input 
            type="checkbox" 
            id="trackSerial"
            checked={productForm.trackSerialNumber}
            onChange={(e) => setProductForm({ ...productForm, trackSerialNumber: e.target.checked })}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
          />
          <label htmlFor="trackSerial" className="text-xs font-semibold text-slate-700">Enable Individual Serial Number Tracking Flag</label>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl text-xs transition shadow-md shadow-indigo-500/20"
        >
          {submitting ? 'Registering SKU...' : 'Save Product SKU'}
        </button>
      </form>
    </div>
  );
}


function ReceivingModule({ session }) {
  const [poReference, setPoReference] = useState('');
  const [challanNumber, setChallanNumber] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [quantityReceived, setQuantityReceived] = useState('');
  const [remarks, setRemarks] = useState('');
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [uploadingBulk, setUploadingBulk] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchMyPendingSubmissions();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('sku, product_name');
    if (data) setProducts(data);
  };

  const fetchMyPendingSubmissions = async () => {
    setLoadingQueue(true);
    const { data: userData } = await supabase
      .from('users')
      .select('user_id')
      .eq('auth_id', session.user.id)
      .single();

    if (userData) {
      const { data, error } = await supabase
        .from('goods_receipts')
        .select(`
          grn_id,
          challan_number,
          sku,
          quantity_received,
          remarks,
          received_date,
          inspection_status
        `)
        .eq('maker_user_id', userData.user_id)
        .eq('inspection_status', 'Pending Inspection')
        .order('received_date', { ascending: false });

      if (!error && data) {
        setPendingSubmissions(data);
      }
    }
    setLoadingQueue(false);
  };

  const handleLogDelivery = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const cleanPoRef = poReference.trim();

      const { data: fallbackPo } = await supabase
        .from('purchase_orders')
        .select('po_id')
        .limit(1)
        .maybeSingle();

      const targetPoId = fallbackPo ? fallbackPo.po_id : 1;
      const structuredRemarks = `PO_REF:${cleanPoRef} | ${remarks.trim()}`;

      const { error: grnError } = await supabase.from('goods_receipts').insert({
        po_id: targetPoId,
        sku: selectedSku,
        quantity_received: parseInt(quantityReceived, 10),
        inspection_status: 'Pending Inspection',
        challan_number: challanNumber.trim(),
        remarks: structuredRemarks
      });

      if (grnError) throw grnError;

      setSuccessMsg(`Delivery successfully logged for PO: ${cleanPoRef}! Placed in Quarantine.`);
      setPoReference('');
      setChallanNumber('');
      setSelectedSku('');
      setQuantityReceived('');
      setRemarks('');
      fetchMyPendingSubmissions();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Excel Template Generator ---
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "PO Reference Number": "PO-2026-001",
        "Challan Number": "CH-1001",
        "SKU Code": "SKU-SUR-1234",
        "Quantity Received": 10,
        "Remarks": "Standard delivery shipment"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receiving Template");
    XLSX.writeFile(workbook, "Goods_Receiving_Template.xlsx");
  };

  // --- Bulk Excel Upload Handler ---
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBulk(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert('The uploaded excel sheet is empty.');
          setUploadingBulk(false);
          return;
        }

        const { data: fallbackPo } = await supabase
          .from('purchase_orders')
          .select('po_id')
          .limit(1)
          .maybeSingle();

        const targetPoId = fallbackPo ? fallbackPo.po_id : 1;

        const { data: userData } = await supabase
          .from('users')
          .select('user_id')
          .eq('auth_id', session.user.id)
          .single();

        const userId = userData?.user_id;

        const bulkInserts = data.map((row) => ({
          po_id: targetPoId,
          sku: String(row["SKU Code"] || '').trim(),
          quantity_received: parseInt(row["Quantity Received"], 10) || 1,
          inspection_status: 'Pending Inspection',
          challan_number: String(row["Challan Number"] || '').trim(),
          remarks: `PO_REF:${String(row["PO Reference Number"] || 'BULK-PO').trim()} | ${String(row["Remarks"] || '').trim()}`,
          maker_user_id: userId
        }));

        const { error } = await supabase.from('goods_receipts').insert(bulkInserts);

        if (error) throw error;

        alert(`Successfully imported ${bulkInserts.length} shipment records into Quarantine queue!`);
        fetchMyPendingSubmissions();
      } catch (err) {
        alert('Bulk upload error: ' + err.message);
      } finally {
        setUploadingBulk(false);
        e.target.value = null; // Reset file input
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleCancelEntry = async (grnId) => {
    if (!confirm('Are you sure you want to cancel and remove this entry?')) return;

    try {
      const { error } = await supabase
        .from('goods_receipts')
        .delete()
        .eq('grn_id', grnId)
        .eq('inspection_status', 'Pending Inspection');

      if (error) throw error;
      fetchMyPendingSubmissions();
    } catch (err) {
      alert('Error cancelling entry: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Goods Receiving</h2>
          <p className="text-xs text-slate-500 mt-1">Log individual inbound shipments or perform batch Excel uploads for quarantine inspection.</p>
        </div>

        {/* Bulk Upload & Template Download Action Header */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadTemplate}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-2xl transition"
          >
            Download Excel Template
          </button>
          <label className={`bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl transition cursor-pointer shadow-sm ${uploadingBulk ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploadingBulk ? 'Processing Bulk...' : 'Upload Excel Sheet'}
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleBulkUpload} className="hidden" />
          </label>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-8 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Inbound Shipment Log</h3>
          <p className="text-xs text-slate-500">Enter manual shipment details below or use the bulk upload above.</p>
        </div>

        <form onSubmit={handleLogDelivery} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">PO Reference Number</label>
              <input 
                type="text" 
                required
                value={poReference}
                onChange={(e) => setPoReference(e.target.value)}
                placeholder="e.g., any custom PO format" 
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Supplier Challan / Waybill No.</label>
              <input 
                type="text" 
                required
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
                placeholder="CH-99281" 
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Select Catalog SKU <span className="text-red-500">*</span></label>
              <select
                required
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              >
                <option value="">-- Choose Catalog Item --</option>
                {products.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.sku} - {p.product_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Quantity Received <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min="1"
                required
                value={quantityReceived}
                onChange={(e) => setQuantityReceived(e.target.value)}
                placeholder="10" 
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Physical Condition / Remarks</label>
            <textarea 
              rows="2"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Note any visible package damage or inventory discrepancy..." 
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl text-xs transition shadow-md shadow-indigo-500/20"
          >
            {submitting ? 'Submitting to Quarantine...' : 'Submit Delivery for Inspection'}
          </button>

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs mt-4 border border-emerald-100 font-semibold">
              {successMsg}
            </div>
          )}
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-8 space-y-4">
        <h4 className="text-sm font-bold text-slate-900">My Submissions Pending Inspection</h4>

        {loadingQueue ? (
          <p className="text-xs text-slate-500">Loading pending items...</p>
        ) : pendingSubmissions.length === 0 ? (
          <div className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
            No active submissions pending manager inspection.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSubmissions.map((item) => {
              let displayPo = 'Custom PO';
              let cleanRemarks = item.remarks || '';

              if (item.remarks && item.remarks.includes('PO_REF:')) {
                const parts = item.remarks.split('|');
                displayPo = parts[0].replace('PO_REF:', '').trim();
                cleanRemarks = parts[1] ? parts[1].trim() : '';
              }

              return (
                <div key={item.grn_id} className="border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs">{displayPo}</span>
                      <span className="text-[10px] bg-amber-50 text-amber-800 px-3 py-0.5 rounded-full font-semibold">Pending Inspection</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">SKU: <span className="font-mono font-bold text-slate-900">{item.sku}</span> | Qty: <span className="font-bold text-slate-900">{item.quantity_received}</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">Challan: <span className="font-medium text-slate-700">{item.challan_number}</span></p>
                    {cleanRemarks && <p className="text-xs text-slate-600 mt-2.5 italic bg-white p-3 rounded-2xl border border-slate-100">"{cleanRemarks}"</p>}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400 font-medium">{new Date(item.received_date).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleCancelEntry(item.grn_id)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-2xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PendingQueuesModule({ session, userRole }) {
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [pendingRequisitions, setPendingRequisitions] = useState([]);
  const [approvedRequisitions, setApprovedRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const isManagerRole = userRole === 'Warehouse Manager' || userRole === 'Manager';

  useEffect(() => {
    fetchQueues();
  }, []);

  const fetchQueues = async () => {
    setLoading(true);
    
    const { data: userData } = await supabase
      .from('users')
      .select('user_id')
      .eq('auth_id', session.user.id)
      .single();

    const userId = userData?.user_id;

    let grnQuery = supabase
      .from('goods_receipts')
      .select(`
        grn_id,
        challan_number,
        sku,
        quantity_received,
        remarks,
        received_date,
        maker_user_id,
        users!goods_receipts_maker_user_id_fkey (full_name, role)
      `)
      .eq('inspection_status', 'Pending Inspection');

    if (!isManagerRole && userId) {
      grnQuery = grnQuery.eq('maker_user_id', userId);
    }
    const { data: grnData } = await grnQuery;
    if (grnData) setPendingReceipts(grnData);

    let reqQuery = supabase
      .from('site_requisitions')
      .select(`
        requisition_id,
        project_site,
        item_description,
        quantity_requested,
        status,
        requested_by,
        created_at,
        users!site_requisitions_requested_by_fkey (full_name, role)
      `)
      .eq('status', 'Pending Manager Review');

    if (!isManagerRole && userId) {
      reqQuery = reqQuery.eq('requested_by', userId);
    }
    const { data: reqData } = await reqQuery;
    if (reqData) setPendingRequisitions(reqData);

    let dispatchQuery = supabase
      .from('site_requisitions')
      .select(`
        requisition_id,
        project_site,
        item_description,
        quantity_requested,
        status,
        requested_by,
        created_at,
        users!site_requisitions_requested_by_fkey (full_name, role)
      `)
      .eq('status', 'Approved');

    const { data: dispatchData } = await dispatchQuery;
    if (dispatchData) setApprovedRequisitions(dispatchData);

    setLoading(false);
  };

  const handleApproveInspection = async (grnId) => {
    if (!isManagerRole) {
      alert('Unauthorized: Only Managers can approve inspections.');
      return;
    }
    setActionLoading(grnId);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_id', session.user.id)
        .single();

      if (userError || !userData) throw new Error('User profile record not found.');

      const { error: updateError } = await supabase
        .from('goods_receipts')
        .update({
          inspection_status: 'Passed',
          checker_user_id: userData.user_id
        })
        .eq('grn_id', grnId);

      if (updateError) throw updateError;

      alert('Inspection approved successfully! Items moved to active inventory.');
      fetchQueues();
    } catch (err) {
      alert('Error processing approval: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineInspection = async (grnId) => {
    if (!isManagerRole) {
      alert('Unauthorized: Only Managers can decline inspections.');
      return;
    }
    setActionLoading(grnId);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_id', session.user.id)
        .single();

      if (userError || !userData) throw new Error('User profile record not found.');

      const { error: updateError } = await supabase
        .from('goods_receipts')
        .update({
          inspection_status: 'Rejected',
          checker_user_id: userData.user_id
        })
        .eq('grn_id', grnId);

      if (updateError) throw updateError;

      alert('Inspection declined and entry rejected successfully.');
      fetchQueues();
    } catch (err) {
      alert('Error declining inspection: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleManagerDecisionRequisition = async (reqId, newStatus) => {
    try {
      const { error } = await supabase
        .from('site_requisitions')
        .update({ status: newStatus })
        .eq('requisition_id', reqId);

      if (error) throw error;
      fetchQueues();
    } catch (err) {
      alert('Error updating requisition status: ' + err.message);
    }
  };

  const handleDispatchRequisition = async (reqId) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_id', session.user.id)
        .single();

      const { error } = await supabase
        .from('site_requisitions')
        .update({ 
          status: 'Dispatched',
          dispatched_by: userData?.user_id 
        })
        .eq('requisition_id', reqId);

      if (error) throw error;
      alert('Material successfully marked as Dispatched & stock deducted.');
      fetchQueues();
    } catch (err) {
      alert('Error dispatching item: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Pending Queues & Dashboard</h2>
        <p className="text-xs text-slate-500 mt-1">Manage inbound quarantine inspections and site outflow approvals.</p>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">Loading pending queues...</p>
      ) : (
        <div className="space-y-6">
          {isManagerRole && (
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-8 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Inbound Goods Receipts (Quarantine Inspection)</span>
                <span className="text-[10px] bg-amber-50 text-amber-800 px-3 py-1 rounded-full font-semibold">{pendingReceipts.length} Pending</span>
              </h4>

              {pendingReceipts.length === 0 ? (
                <div className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                  No pending goods receipts in the queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReceipts.map((item) => {
                    let displayPo = 'Custom PO';
                    let cleanRemarks = item.remarks || '';

                    if (item.remarks && item.remarks.includes('PO_REF:')) {
                      const parts = item.remarks.split('|');
                      displayPo = parts[0].replace('PO_REF:', '').trim();
                      cleanRemarks = parts[1] ? parts[1].trim() : '';
                    }

                    return (
                      <div key={item.grn_id} className="border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-xs">{displayPo}</span>
                            <span className="text-[10px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold">Pending Inspection</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1.5">SKU: <span className="font-mono font-bold text-slate-900">{item.sku}</span> | Qty: <span className="font-bold text-slate-900">{item.quantity_received}</span></p>
                          <p className="text-xs text-slate-500 mt-0.5">Challan: <span className="font-medium text-slate-700">{item.challan_number}</span></p>
                          <p className="text-xs text-slate-500 mt-0.5">Logged By: <span className="font-medium text-slate-700">{item.users?.full_name || 'Staff'}</span> ({item.users?.role})</p>
                          {cleanRemarks && <p className="text-xs text-slate-600 mt-2.5 italic bg-white p-3 rounded-2xl border border-slate-100">"{cleanRemarks}"</p>}
                        </div>

                        <div className="flex items-center space-x-2.5">
                          <button
                            onClick={() => handleDeclineInspection(item.grn_id)}
                            disabled={actionLoading === item.grn_id}
                            className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-2xl transition whitespace-nowrap"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleApproveInspection(item.grn_id)}
                            disabled={actionLoading === item.grn_id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl transition whitespace-nowrap shadow-xs"
                          >
                            Approve & Stock
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {isManagerRole && (
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-8 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Site Requisitions (Pending Manager Review)</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">{pendingRequisitions.length} Pending</span>
              </h4>

              {pendingRequisitions.length === 0 ? (
                <div className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                  No site requisitions pending manager review.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequisitions.map((req) => (
                    <div key={req.requisition_id} className="border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900 text-xs">{req.project_site}</span>
                          <span className="text-[10px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold">{req.status}</span>
                        </div>
                        <p className="text-xs text-slate-800 mt-1.5 font-medium">{req.quantity_requested}x {req.item_description}</p>
                        <p className="text-xs text-slate-500 mt-1">Requested By: {req.users?.full_name || 'Staff'} ({req.users?.role})</p>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <button
                          onClick={() => handleManagerDecisionRequisition(req.requisition_id, 'Rejected')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-2xl transition whitespace-nowrap"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleManagerDecisionRequisition(req.requisition_id, 'Approved')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl transition whitespace-nowrap"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isManagerRole && (
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-8 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Approved Requisitions (Ready for Warehouse Dispatch)</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-semibold">{approvedRequisitions.length} Ready</span>
              </h4>

              {approvedRequisitions.length === 0 ? (
                <div className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                  No approved requisitions awaiting dispatch.
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedRequisitions.map((req) => (
                    <div key={req.requisition_id} className="border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900 text-xs">{req.project_site}</span>
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">{req.status}</span>
                        </div>
                        <p className="text-xs text-slate-800 mt-1.5 font-medium">{req.quantity_requested}x {req.item_description}</p>
                        <p className="text-xs text-slate-500 mt-1">Requested By: {req.users?.full_name || 'Staff'}</p>
                      </div>

                      <button
                        onClick={() => handleDispatchRequisition(req.requisition_id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl transition whitespace-nowrap shadow-xs"
                      >
                        Mark Dispatched & Deduct Stock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportsModule({ session }) {
  const [reportType, setReportType] = useState('daily_stock');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData(reportType);
  }, [reportType]);

  const fetchReportData = async (type) => {
    setLoading(true);
    setReportData([]);

    try {
      if (type === 'daily_stock') {
        const { data, error } = await supabase
          .from('goods_receipts')
          .select(`
            grn_id,
            sku,
            quantity_received,
            received_date,
            inspection_status
          `)
          .eq('inspection_status', 'Passed')
          .order('received_date', { ascending: false });

        if (error) throw error;
        setReportData(data || []);
      } 
      else if (type === 'monthly_stock') {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('category', { ascending: true });

        if (error) throw error;
        setReportData(data || []);
      } 
      else if (type === 'dispatched_devices') {
        const { data, error } = await supabase
          .from('site_requisitions')
          .select(`
            requisition_id,
            project_site,
            item_description,
            quantity_requested,
            status,
            created_at,
            users!site_requisitions_requested_by_fkey (full_name, role)
          `)
          .eq('status', 'Dispatched')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReportData(data || []);
      }
    } catch (err) {
      alert(`Error loading report data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Report Switcher Controls (Hidden on Print) */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-8 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Executive Reports</h2>
            <p className="text-xs text-slate-500 mt-1">Generate certified audit statements formatted to international reporting standards.</p>
          </div>
          <button
            onClick={handlePrintPDF}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-3 rounded-2xl text-xs transition shadow-sm flex items-center space-x-2 shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5 border-t border-slate-100 pt-5">
          <button
            onClick={() => setReportType('daily_stock')}
            className={`px-4.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              reportType === 'daily_stock' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Daily Stock Statement
          </button>
          <button
            onClick={() => setReportType('monthly_stock')}
            className={`px-4.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              reportType === 'monthly_stock' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Monthly Inventory Master
          </button>
          <button
            onClick={() => setReportType('dispatched_devices')}
            className={`px-4.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              reportType === 'dispatched_devices' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Site Dispatched Equipment Log
          </button>
        </div>
      </div>

      {/* Print-Only Isolation Rule */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* International Standard Clean Report Layout Card */}
      <div id="printable-report" className="bg-white rounded-3xl shadow-xs border border-slate-200 p-10 font-sans text-slate-900">
        {/* Report Header Metadata Block */}
        <div className="border-b border-slate-200 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Site Inventory PWA • Official Audit Log</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {reportType === 'daily_stock' && 'Daily Stock Inspection Statement'}
              {reportType === 'monthly_stock' && 'Monthly Stock Inventory Master Report'}
              {reportType === 'dispatched_devices' && 'Site Dispatched Devices & Materials Report'}
            </h2>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5 bg-slate-50/80 px-4 py-3 rounded-2xl border border-slate-100">
            <p><span className="font-bold text-slate-800">Generated:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="font-bold text-slate-800">Authority:</span> Warehouse Manager</p>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 py-16 text-center font-medium">Compiling audit data...</p>
        ) : reportData.length === 0 ? (
          <div className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-3xl p-16 text-center">
            No records found for the selected report criteria.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  {reportType === 'daily_stock' && (
                    <>
                      <th className="py-4 px-5 border-r border-slate-200">GRN Reference ID</th>
                      <th className="py-4 px-5 border-r border-slate-200">PO Number</th>
                      <th className="py-4 px-5 border-r border-slate-200">SKU Code</th>
                      <th className="py-4 px-5 border-r border-slate-200 text-center">Quantity Passed</th>
                      <th className="py-4 px-5 text-right">Received Date</th>
                    </>
                  )}
                  {reportType === 'monthly_stock' && (
                    <>
                      <th className="py-4 px-5 border-r border-slate-200">SKU</th>
                      <th className="py-4 px-5 border-r border-slate-200">Product Name</th>
                      <th className="py-4 px-5 border-r border-slate-200">Category</th>
                      <th className="py-4 px-5 border-r border-slate-200">MPN</th>
                      <th className="py-4 px-5 text-center">Serial Tracking</th>
                    </>
                  )}
                  {reportType === 'dispatched_devices' && (
                    <>
                      <th className="py-4 px-5 border-r border-slate-200">Requisition ID</th>
                      <th className="py-4 px-5 border-r border-slate-200">Project Site / Area</th>
                      <th className="py-4 px-5 border-r border-slate-200">Item Description</th>
                      <th className="py-4 px-5 border-r border-slate-200 text-center">Qty Dispatched</th>
                      <th className="py-4 px-5 text-right">Requested By</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {reportData.map((row, index) => {
                  let displayPo = 'N/A';
                  if (row.remarks && row.remarks.includes('PO_REF:')) {
                    displayPo = row.remarks.split('|')[0].replace('PO_REF:', '').trim();
                  }

                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition">
                      {reportType === 'daily_stock' && (
                        <>
                          <td className="py-3.5 px-5 font-mono text-slate-600 border-r border-slate-100">{row.grn_id}</td>
                          <td className="py-3.5 px-5 font-semibold text-slate-900 border-r border-slate-100">{displayPo}</td>
                          <td className="py-3.5 px-5 font-mono font-bold text-indigo-600 border-r border-slate-100">{row.sku}</td>
                          <td className="py-3.5 px-5 font-bold text-center text-slate-900 border-r border-slate-100">{row.quantity_received}</td>
                          <td className="py-3.5 px-5 text-slate-600 text-right">{new Date(row.received_date).toLocaleDateString()}</td>
                        </>
                      )}
                      {reportType === 'monthly_stock' && (
                        <>
                          <td className="py-3.5 px-5 font-mono font-bold text-indigo-600 border-r border-slate-100">{row.sku}</td>
                          <td className="py-3.5 px-5 font-medium text-slate-900 border-r border-slate-100">{row.product_name}</td>
                          <td className="py-3.5 px-5 text-slate-600 border-r border-slate-100">{row.category} {row.sub_category ? `(${row.sub_category})` : ''}</td>
                          <td className="py-3.5 px-5 font-mono text-slate-500 border-r border-slate-100">{row.mpn || '—'}</td>
                          <td className="py-3.5 px-5 text-center">
                            <span className={`inline-block text-[10px] px-2.5 py-1 rounded-full font-semibold ${row.track_serial_number ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                              {row.track_serial_number ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                        </>
                      )}
                      {reportType === 'dispatched_devices' && (
                        <>
                          <td className="py-3.5 px-5 font-mono text-slate-600 border-r border-slate-100">{row.requisition_id}</td>
                          <td className="py-3.5 px-5 font-semibold text-slate-900 border-r border-slate-100">{row.project_site}</td>
                          <td className="py-3.5 px-5 text-slate-700 border-r border-slate-100">{row.item_description}</td>
                          <td className="py-3.5 px-5 font-bold text-center text-emerald-600 border-r border-slate-100">{row.quantity_requested}</td>
                          <td className="py-3.5 px-5 text-slate-600 text-right">{row.users?.full_name || 'Staff'}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RequisitionModule({ session, userRole }) {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectSite, setProjectSite] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  const isManagerRole = userRole === 'Warehouse Manager' || userRole === 'Manager';

  useEffect(() => {
    fetchUserDataAndRequisitions();
  }, []);

  const fetchUserDataAndRequisitions = async () => {
    setLoading(true);
    const { data: userData } = await supabase
      .from('users')
      .select('user_id')
      .eq('auth_id', session.user.id)
      .single();

    if (userData) setCurrentUserId(userData.user_id);

    const { data, error } = await supabase
      .from('site_requisitions')
      .select(`
        requisition_id,
        project_site,
        item_description,
        quantity_requested,
        status,
        requested_by,
        created_at,
        users!site_requisitions_requested_by_fkey (full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) setRequisitions(data);
    setLoading(false);
  };

  const handleCreateRequisition = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_id', session.user.id)
        .single();

      if (userError || !userData) throw new Error('User profile not found.');

      const { error: insertError } = await supabase.from('site_requisitions').insert({
        project_site: projectSite,
        item_description: itemDescription,
        quantity_requested: parseInt(quantity, 10),
        requested_by: userData.user_id,
        status: 'Pending Manager Review'
      });

      if (insertError) throw insertError;

      setSuccessMsg('Material requisition successfully submitted for executive review.');
      setProjectSite('');
      setItemDescription('');
      setQuantity('');
      fetchUserDataAndRequisitions();
    } catch (err) {
      alert('Error submitting requisition: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequisition = async (requisitionId) => {
    if (!window.confirm('Are you sure you want to delete this requisition?')) return;
    try {
      const { error } = await supabase
        .from('site_requisitions')
        .delete()
        .eq('requisition_id', requisitionId);

      if (error) throw error;
      fetchUserDataAndRequisitions();
    } catch (err) {
      alert(`Failed to delete requisition: ${err.message}`);
    }
  };

  const handleCancelRequisition = async (reqId) => {
    try {
      const { error } = await supabase
        .from('site_requisitions')
        .update({ status: 'Cancelled' })
        .eq('requisition_id', reqId);

      if (error) throw error;
      fetchUserDataAndRequisitions();
    } catch (err) {
      alert('Error cancelling requisition: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Site Requisitions</h2>
        <p className="text-xs text-slate-500 mt-1">Submit and monitor material outflow requests across active project sites.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-8 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">New Material Requisition</h3>
          <p className="text-xs text-slate-500">Specify precise project site and part requirements for warehouse fulfillment.</p>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs border border-emerald-100 font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleCreateRequisition} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Project Site / Area</label>
            <input 
              type="text" 
              required
              value={projectSite}
              onChange={(e) => setProjectSite(e.target.value)}
              placeholder="e.g., Warehouse Bay 3 / North Perimeter" 
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Item Description / Part Number</label>
            <input 
              type="text" 
              required
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g., 4MP IP Bullet Camera & Mounting Brackets" 
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Quantity Requested</label>
            <input 
              type="number" 
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10" 
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
            />
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl text-xs transition shadow-md shadow-indigo-500/20"
          >
            {submitting ? 'Submitting Requisition...' : 'Submit Requisition Request'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-8 space-y-4">
        <h4 className="text-sm font-bold text-slate-900">All Requisitions Log</h4>

        {loading ? (
          <p className="text-xs text-slate-500">Loading requisitions...</p>
        ) : requisitions.length === 0 ? (
          <div className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
            No active material requisitions found.
          </div>
        ) : (
          <div className="space-y-3">
            {requisitions.map((req) => {
              const isOwner = req.requested_by === currentUserId;
              const canDelete = isManagerRole || (isOwner && req.status === 'Pending Manager Review');

              return (
                <div key={req.requisition_id} className="border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-xs">{req.project_site}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                        req.status === 'Pending Manager Review' ? 'bg-amber-50 text-amber-800' :
                        req.status === 'Approved' ? 'bg-blue-50 text-blue-700' :
                        req.status === 'Dispatched' ? 'bg-emerald-50 text-emerald-800' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 mt-1.5 font-medium">{req.quantity_requested}x {req.item_description}</p>
                    <p className="text-xs text-slate-500 mt-1">Requested By: {req.users?.full_name || 'Staff'} ({new Date(req.created_at).toLocaleDateString()})</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {req.status === 'Pending Manager Review' && isOwner && (
                      <button
                        onClick={() => handleCancelRequisition(req.requisition_id)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-2xl transition"
                      >
                        Cancel
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteRequisition(req.requisition_id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl transition shadow-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}