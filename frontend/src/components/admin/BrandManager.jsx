import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { apiGetBrands, apiCreateBrand, apiUpdateBrand, apiDeleteBrand } from '../../data/api';
import toast from 'react-hot-toast';

export default function BrandManager() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentBrand, setCurrentBrand] = useState({ _id: '', name: '', logo: '', color: '' });

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const { data } = await apiGetBrands();
            setBrands(data.brands || []);
        } catch (error) {
            console.error("Failed to fetch brands", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleSave = async () => {
        try {
            if (editMode) {
                await apiUpdateBrand(currentBrand._id, { name: currentBrand.name, logo: currentBrand.logo, color: currentBrand.color });
            } else {
                await apiCreateBrand({ name: currentBrand.name, logo: currentBrand.logo, color: currentBrand.color });
            }
            toast.success(editMode ? 'Brand updated!' : 'Brand added!');
            setShowModal(false);
            fetchBrands();
        } catch (error) {
            console.error('Failed to save brand', error);
            toast.error(error.response?.data?.message || 'Error saving brand');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this brand?")) {
            try {
                await apiDeleteBrand(id);
                fetchBrands();
            } catch (error) {
                console.error("Failed to delete brand", error);
            }
        }
    };

    const openEdit = (brand) => {
        setCurrentBrand(brand);
        setEditMode(true);
        setShowModal(true);
    };

    const openAdd = () => {
        setCurrentBrand({ _id: '', name: '', logo: '🔵', color: 'from-blue-600 to-blue-800' });
        setEditMode(false);
        setShowModal(true);
    };

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-800 flex-wrap gap-3">
                <h3 className="font-bold text-white">Brands ({brands.length})</h3>
                <button onClick={openAdd} className="btn-primary text-xs">
                    <Plus className="w-4 h-4" /> Add Brand
                </button>
            </div>
            {loading ? <div className="p-5 text-gray-400">Loading Brands...</div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800/50 text-gray-400 text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Brand</th>
                                <th className="px-4 py-3 text-left font-semibold">Products Count</th>
                                <th className="px-4 py-3 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {brands.map(b => (
                                <tr key={b._id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${b.color} flex items-center justify-center text-white`}>
                                                {b.logo}
                                            </div>
                                            <span className="text-white font-medium">{b.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{b.count}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {brands.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-5 text-center text-gray-500">No brands found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-800">
                            <h3 className="font-bold text-white text-lg">
                                {editMode ? 'Edit Brand' : 'Add Brand'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Name</label>
                                <input value={currentBrand.name} onChange={e => setCurrentBrand({ ...currentBrand, name: e.target.value })} placeholder="e.g. Apple" className="w-full input-field" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Logo (Emoji or text)</label>
                                <input value={currentBrand.logo} onChange={e => setCurrentBrand({ ...currentBrand, logo: e.target.value })} placeholder="🍏" className="w-full input-field" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Gradient Color Classes</label>
                                <input value={currentBrand.color} onChange={e => setCurrentBrand({ ...currentBrand, color: e.target.value })} placeholder="from-gray-700 to-gray-900" className="w-full input-field" />
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-800 flex gap-3">
                            <button onClick={() => setShowModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                            <button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
